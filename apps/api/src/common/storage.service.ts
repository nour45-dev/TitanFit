import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

export interface PresignedUploadRequest {
  readonly tenantId: string;
  readonly folder: 'avatars' | 'progress-photos' | 'exercise-media' | 'documents' | 'instapay-receipts';
  readonly fileName: string;
  readonly contentType: string;
  readonly maxSizeBytes?: number;
}

export interface PresignedUploadResult {
  readonly objectKey: string;
  readonly uploadUrl: string;
  readonly expiresInSeconds: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'application/pdf',
]);

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly defaultTtl: number;

  constructor() {
    this.bucket = process.env.STORAGE_BUCKET || 'gymos-media';
    this.defaultTtl = Number(process.env.STORAGE_SIGNED_URL_TTL_SECONDS || 900);
    this.s3 = new S3Client({
      region: process.env.STORAGE_REGION || 'auto',
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      forcePathStyle: (process.env.STORAGE_FORCE_PATH_STYLE ?? 'true') === 'true',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || 'gymos_minio_admin',
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || 'gymos_minio_secret_key',
      },
    });
  }

  async createSignedUploadUrl(input: PresignedUploadRequest): Promise<PresignedUploadResult> {
    if (!ALLOWED_MIME_TYPES.has(input.contentType)) {
      throw new Error(`Unsupported file content-type: ${input.contentType}`);
    }

    const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `tenants/${input.tenantId}/${input.folder}/${Date.now()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.defaultTtl,
    });

    return {
      objectKey,
      uploadUrl,
      expiresInSeconds: this.defaultTtl,
    };
  }

  async createSignedDownloadUrl(tenantId: string, objectKey: string): Promise<string> {
    if (!objectKey.startsWith(`tenants/${tenantId}/`)) {
      throw new Error('Cross-tenant storage access denied');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: this.defaultTtl,
    });
  }
}
