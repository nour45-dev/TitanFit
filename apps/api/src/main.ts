import 'reflect-metadata';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { PLATFORM_CONFIG, validateApiEnv } from '@gymos/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/global-exception.filter.js';
import { logger } from './common/logger.js';

async function bootstrap() {
  const env = validateApiEnv(process.env);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
      requestIdHeader: 'x-request-id',
      bodyLimit: 5 * 1024 * 1024, // 5MB request size limit
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  });

  const allowedOrigins = env.API_CORS_ORIGINS.split(',').map((o) => o.trim());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCors as any, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${PLATFORM_CONFIG.appName} API`)
    .setDescription(PLATFORM_CONFIG.tagline.en)
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT || env.API_PORT);
  await app.listen(port, env.API_HOST);

  logger.info(
    {
      port,
      host: env.API_HOST,
      appName: PLATFORM_CONFIG.appName,
      docsUrl: `/api/docs`,
      healthUrl: `/api/v1/health`,
      readyUrl: `/api/v1/ready`,
    },
    `${PLATFORM_CONFIG.appName} API server listening`,
  );
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to bootstrap GymOS API server');
  process.exit(1);
});
