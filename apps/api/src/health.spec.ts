import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module.js';
import { StorageService } from './common/storage.service.js';

describe('GymOS API Health & Storage Security Suite', () => {
  let app: NestFastifyApplication;
  let storageService: StorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('api/v1');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    storageService = moduleRef.get<StorageService>(StorageService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/health returns 200 OK with standardized v1 envelope', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { 'x-request-id': 'test-req-001' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.service).toBe('gymos-api');
    expect(body.meta.requestId).toBe('test-req-001');
    expect(body.meta.version).toBe('v1');
  });

  it('StorageService generates tenant-isolated signed URLs and blocks cross-tenant access', async () => {
    const tenantA = '11111111-1111-4111-8111-111111111111';
    const tenantB = '22222222-2222-4222-8222-222222222222';

    const upload = await storageService.createSignedUploadUrl({
      tenantId: tenantA,
      folder: 'avatars',
      fileName: 'member-photo.jpg',
      contentType: 'image/jpeg',
    });

    expect(upload.objectKey.startsWith(`tenants/${tenantA}/avatars/`)).toBe(true);
    expect(upload.uploadUrl).toContain(upload.objectKey);

    // Tenant A can generate download URL for its own key
    const downloadUrl = await storageService.createSignedDownloadUrl(tenantA, upload.objectKey);
    expect(downloadUrl).toContain(upload.objectKey);

    // Tenant B is blocked from generating a signed download URL for Tenant A's object
    await expect(
      storageService.createSignedDownloadUrl(tenantB, upload.objectKey),
    ).rejects.toThrow(/Cross-tenant storage access denied/);

    // Disallowed executable MIME types are rejected
    await expect(
      storageService.createSignedUploadUrl({
        tenantId: tenantA,
        folder: 'documents',
        fileName: 'malware.exe',
        contentType: 'application/x-msdownload',
      }),
    ).rejects.toThrow(/Unsupported file content-type/);
  });
});
