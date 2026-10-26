import {
  type PermissionCode,
  hasAllPermissions,
} from '@gymos/contracts';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { CryptoService, type JwtClaims } from './crypto.service.js';

export const PERMISSIONS_METADATA_KEY = 'titanfit:required_permissions';
export const PUBLIC_ROUTE_KEY = 'titanfit:public_route';

export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);

export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);

export interface AuthenticatedFastifyRequest extends FastifyRequest {
  user?: JwtClaims;
}

@Injectable()
export class AuthRbacGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(CryptoService) private readonly cryptoService: CryptoService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedFastifyRequest>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'MISSING_BEARER_TOKEN',
        message: 'Authentication required: missing Bearer token',
      });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    let claims: JwtClaims;
    try {
      claims = this.cryptoService.verifyAccessToken(token);
    } catch (err) {
      throw new UnauthorizedException({
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: err instanceof Error ? err.message : 'Invalid access token',
      });
    }

    request.user = claims;

    const requiredPermissions =
      this.reflector.getAllAndOverride<PermissionCode[]>(PERMISSIONS_METADATA_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length > 0) {
      const allowed = hasAllPermissions(claims.permissions, requiredPermissions);
      if (!allowed) {
        throw new ForbiddenException({
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Missing required permission(s): ${requiredPermissions.join(', ')}`,
        });
      }
    }

    return true;
  }
}
