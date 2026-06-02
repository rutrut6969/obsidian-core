import { Injectable } from '@nestjs/common';
import { AuditSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type AuditInput = {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
  applicationId?: string;
  severity?: AuditSeverity;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        organizationId: input.organizationId,
        applicationId: input.applicationId,
        severity: input.severity,
      },
    });
  }
}
