import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: AuthenticatedUser }>();
    const token = this.extractToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token, {
        secret: this.configService.get<string>('auth.accessSecret'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                  applicationPermissions: {
                    include: {
                      applicationPermission: {
                        include: { application: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or no longer exists.');
      }

      request.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map((userRole) => userRole.role.name),
        permissions: [
          ...new Set(
            user.roles.flatMap((userRole) =>
              [
                ...userRole.role.permissions.map((rolePermission) => rolePermission.permission.name),
                ...userRole.role.applicationPermissions.map(
                  (rolePermission) => rolePermission.applicationPermission.permissionName,
                ),
              ],
            ),
          ),
        ],
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private extractToken(authorization?: string): string | undefined {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
