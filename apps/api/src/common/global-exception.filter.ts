import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from './logger.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const requestId =
      (request.headers['x-request-id'] as string | undefined) || request.id || 'req-unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        code = (resObj.code as string) || HttpStatus[status] || 'HTTP_ERROR';
      }
    } else if (exception instanceof Error) {
      logger.error(
        { err: exception, requestId, url: request.url, method: request.method },
        'Unhandled application exception',
      );
    }

    reply.status(status).send({
      success: false,
      error: {
        code,
        message,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }
}
