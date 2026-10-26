import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { Injectable } from '@nestjs/common';

export interface EncryptedFieldPayload {
  readonly ciphertextHex: string;
  readonly ivHex: string;
  readonly authTagHex: string;
}

export interface JwtClaims {
  readonly sub: string;
  readonly tenantId: string;
  readonly tenantSlug: string;
  readonly branchId: string | null;
  readonly roleKeys: readonly string[];
  readonly permissions: readonly string[];
  readonly impersonatedByUserId?: string | null;
  readonly iat: number;
  readonly exp: number;
}

@Injectable()
export class CryptoService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly healthKeyBuffer: Buffer;
  private readonly qrMasterSecret: string;

  constructor() {
    this.accessSecret =
      process.env.JWT_ACCESS_SECRET ||
      'default_dev_jwt_access_secret_minimum_32_chars_long_000000';
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      'default_dev_jwt_refresh_secret_minimum_32_chars_long_00000';
    const hexKey =
      process.env.HEALTH_DATA_ENCRYPTION_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.healthKeyBuffer = Buffer.from(hexKey.slice(0, 64), 'hex');
    this.qrMasterSecret =
      process.env.QR_HMAC_MASTER_SECRET ||
      'default_dev_qr_hmac_master_secret_minimum_32_chars_000000';
  }

  /**
   * Memory-hard password hashing (`scrypt` with N=16384, r=8, p=1, 64-byte key + 16-byte salt)
   * formatted in modular crypt format `$scrypt$n=16384,r=8,p=1$<saltHex>$<hashHex>`.
   */
  hashPassword(plainPassword: string): string {
    const salt = randomBytes(16);
    const derived = scryptSync(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 });
    return `$scrypt$n=16384,r=8,p=1$${salt.toString('hex')}$${derived.toString('hex')}`;
  }

  verifyPassword(plainPassword: string, storedHash: string): boolean {
    const parts = storedHash.split('$');
    if (parts.length !== 5 || parts[1] !== 'scrypt') {
      return false;
    }
    const saltHex = parts[3];
    const hashHex = parts[4];
    if (!saltHex || !hashHex) return false;

    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const derived = scryptSync(plainPassword, salt, expected.length, {
      N: 16384,
      r: 8,
      p: 1,
    });
    return timingSafeEqual(derived, expected);
  }

  /**
   * AES-256-GCM authenticated encryption at rest for sensitive Member Health Records.
   * Uses tenantId as Additional Authenticated Data (AAD) so an encrypted health blob
   * cannot even be decrypted if copied to a different tenant!
   */
  encryptHealthData(plaintextJson: string, tenantId: string): EncryptedFieldPayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.healthKeyBuffer, iv);
    cipher.setAAD(Buffer.from(tenantId, 'utf8'));

    const encrypted = Buffer.concat([
      cipher.update(plaintextJson, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertextHex: encrypted.toString('hex'),
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
    };
  }

  decryptHealthData(payload: EncryptedFieldPayload, tenantId: string): string {
    const iv = Buffer.from(payload.ivHex, 'hex');
    const authTag = Buffer.from(payload.authTagHex, 'hex');
    const encrypted = Buffer.from(payload.ciphertextHex, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', this.healthKeyBuffer, iv);
    decipher.setAAD(Buffer.from(tenantId, 'utf8'));
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  /**
   * Signs a compact HS256 JWT without external native dependencies.
   */
  signAccessToken(
    claims: Omit<JwtClaims, 'iat' | 'exp'>,
    ttlSeconds: number = 900,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const fullClaims: JwtClaims = {
      ...claims,
      iat: now,
      exp: now + ttlSeconds,
    };

    const headerB64 = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(fullClaims)).toString('base64url');
    const signature = createHmac('sha256', this.accessSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  verifyAccessToken(token: string): JwtClaims {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed JWT token');
    }
    const [headerB64, payloadB64, signatureB64] = parts as [string, string, string];
    const expectedSig = createHmac('sha256', this.accessSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signatureB64);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('Invalid JWT signature');
    }

    const claims = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as JwtClaims;
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp <= now) {
      throw new Error('JWT token has expired');
    }
    return claims;
  }

  /**
   * RFC 6238 TOTP 6-digit code generator & verifier (30-second step).
   */
  generateTotpCode(secretHex: string, timestampMs: number = Date.now()): string {
    const counter = Math.floor(timestampMs / 1000 / 30);
    const counterBuf = Buffer.alloc(8);
    counterBuf.writeBigInt64BE(BigInt(counter));

    const hmac = createHmac('sha1', Buffer.from(secretHex, 'hex'))
      .update(counterBuf)
      .digest();
    const offset = (hmac[hmac.length - 1] ?? 0) & 0x0f;
    const binary =
      (((hmac[offset] ?? 0) & 0x7f) << 24) |
      (((hmac[offset + 1] ?? 0) & 0xff) << 16) |
      (((hmac[offset + 2] ?? 0) & 0xff) << 8) |
      ((hmac[offset + 3] ?? 0) & 0xff);

    return (binary % 1_000_000).toString().padStart(6, '0');
  }

  verifyTotpCode(
    secretHex: string,
    code: string,
    timestampMs: number = Date.now(),
  ): boolean {
    for (const driftStep of [-1, 0, 1]) {
      const candidate = this.generateTotpCode(
        secretHex,
        timestampMs + driftStep * 30_000,
      );
      if (candidate === code) {
        return true;
      }
    }
    return false;
  }

  /**
   * Derives a member-specific QR signing secret and generates/verifies
   * 30-second rotating offline QR tokens:
   * Format: `TITANFIT:v1:<tenantId>:<memberId>:<window>:<hmacHex>`
   */
  deriveMemberQrSecret(tenantId: string, memberId: string): string {
    return createHmac('sha256', this.qrMasterSecret)
      .update(`${tenantId}:${memberId}`)
      .digest('hex');
  }

  generateRotatingQrToken(
    tenantId: string,
    memberId: string,
    timestampMs: number = Date.now(),
  ): string {
    const windowStep = Math.floor(timestampMs / 1000 / 30);
    const memberSecret = this.deriveMemberQrSecret(tenantId, memberId);
    const payload = `TITANFIT:v1:${tenantId}:${memberId}:${windowStep}`;
    const sig = createHmac('sha256', memberSecret)
      .update(payload)
      .digest('hex')
      .slice(0, 32);
    return `${payload}:${sig}`;
  }

  verifyRotatingQrToken(
    qrToken: string,
    expectedTenantId: string,
    timestampMs: number = Date.now(),
  ): { valid: boolean; memberId?: string; reason?: string } {
    const parts = qrToken.split(':');
    if (parts.length !== 6 || parts[0] !== 'TITANFIT' || parts[1] !== 'v1') {
      return { valid: false, reason: 'MALFORMED_QR_TOKEN' };
    }
    const [, , tokenTenantId, memberId, windowStr, providedSig] = parts as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];

    if (tokenTenantId !== expectedTenantId) {
      return { valid: false, reason: 'CROSS_TENANT_QR_REJECTED' };
    }

    const tokenWindow = Number(windowStr);
    const currentWindow = Math.floor(timestampMs / 1000 / 30);
    if (Math.abs(currentWindow - tokenWindow) > 2) {
      return { valid: false, reason: 'QR_TOKEN_EXPIRED' };
    }

    const memberSecret = this.deriveMemberQrSecret(tokenTenantId, memberId);
    const payload = `TITANFIT:v1:${tokenTenantId}:${memberId}:${tokenWindow}`;
    const expectedSig = createHmac('sha256', memberSecret)
      .update(payload)
      .digest('hex')
      .slice(0, 32);

    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { valid: false, reason: 'INVALID_QR_SIGNATURE' };
    }

    return { valid: true, memberId };
  }
}
