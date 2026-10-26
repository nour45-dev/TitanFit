import { PLATFORM_CONFIG } from '@gymos/config';
import {
  type HealthStatus,
  type ReadinessStatus,
  createSuccessResponse,
} from '@gymos/contracts';
import { prisma, verifyRuntimeRoleSecurity } from '@gymos/database';
import { Controller, Get, Headers, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { Redis } from 'ioredis';

@ApiTags('System Health & Readiness')
@Controller()
export class HealthController {
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe for Railway and uptime monitors' })
  getHealth(@Headers('x-request-id') requestId?: string) {
    const payload: HealthStatus = {
      status: 'ok',
      service: 'gymos-api',
      appName: PLATFORM_CONFIG.appName,
      version: '0.1.0',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
    return createSuccessResponse(payload, requestId || 'req-health');
  }

  @Get('ready')
  @ApiOperation({
    summary:
      'Readiness probe verifying PostgreSQL connectivity, non-bypassable RLS role (NOBYPASSRLS), and Redis connectivity',
  })
  async getReadiness(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Headers('x-request-id') requestId?: string,
  ) {
    let dbConnected = false;
    let currentRole = 'disconnected';
    let rlsEnforced = false;
    let dbLatencyMs = 0;

    const dbStart = performance.now();
    try {
      const roleStatus = await verifyRuntimeRoleSecurity(prisma);
      dbLatencyMs = Number((performance.now() - dbStart).toFixed(2));
      dbConnected = true;
      currentRole = roleStatus.currentRole;
      rlsEnforced = roleStatus.rlsStrictlyEnforced;
    } catch {
      dbLatencyMs = Number((performance.now() - dbStart).toFixed(2));
      dbConnected = false;
    }

    let redisConnected = false;
    let redisLatencyMs = 0;
    const redisStart = performance.now();
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
      const redis = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
      });
      try {
        await redis.connect();
        const pong = await redis.ping();
        redisConnected = pong === 'PONG';
      } catch {
        redisConnected = false;
      } finally {
        redisLatencyMs = Number((performance.now() - redisStart).toFixed(2));
        redis.disconnect();
      }
    }

    const isReady = dbConnected && rlsEnforced && redisConnected;
    if (!isReady) {
      reply.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    const payload: ReadinessStatus = {
      status: isReady ? 'ready' : 'not_ready',
      checks: {
        database: {
          connected: dbConnected,
          currentRole,
          rlsEnforced,
          latencyMs: dbLatencyMs,
        },
        redis: {
          connected: redisConnected,
          latencyMs: redisLatencyMs,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return createSuccessResponse(payload, requestId || 'req-ready');
  }
}
