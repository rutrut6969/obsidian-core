import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditSeverity } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';

export type DeviceSessionContext = {
  deviceName?: string;
  deviceType?: string;
  platform?: string;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  findForUser(userId: string) {
    return this.prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async createForLogin(userId: string, refreshTokenId: string, context: DeviceSessionContext) {
    return this.prisma.deviceSession.create({
      data: {
        userId,
        refreshTokenId,
        deviceName: context.deviceName,
        deviceType: context.deviceType,
        platform: context.platform,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        lastSeenAt: new Date(),
      },
    });
  }

  async rotateRefreshToken(sessionId: string, refreshTokenId: string, context: DeviceSessionContext) {
    return this.prisma.deviceSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        lastSeenAt: new Date(),
      },
    });
  }

  async touchByRefreshToken(refreshTokenId: string, context: DeviceSessionContext) {
    return this.prisma.deviceSession.updateMany({
      where: { refreshTokenId, isRevoked: false },
      data: {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        lastSeenAt: new Date(),
      },
    });
  }

  async revoke(id: string, userId: string) {
    const session = await this.prisma.deviceSession.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found.');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('Cannot revoke another user session.');
    }

    await this.prisma.$transaction([
      this.prisma.deviceSession.update({
        where: { id },
        data: { isRevoked: true },
      }),
      ...(session.refreshTokenId
        ? [
            this.prisma.refreshToken.update({
              where: { id: session.refreshTokenId },
              data: { revokedAt: new Date() },
            }),
          ]
        : []),
    ]);

    await this.auditService.record({
      userId,
      action: 'session.revoke',
      entityType: 'DeviceSession',
      entityId: id,
      severity: AuditSeverity.SECURITY,
    });

    return { revoked: true, id };
  }
}
