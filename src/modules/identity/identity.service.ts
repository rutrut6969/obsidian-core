import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AuditSeverity, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { DeviceSessionContext, SessionsService } from '../sessions/sessions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type IdentityUser = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } };
          };
        };
      };
    };
    applications: { include: { application: true } };
    notificationPreference: true;
    organizations: { include: { organization: true } };
    teams: { include: { team: true } };
  };
}>;

type RequestContext = DeviceSessionContext;

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly sessionsService: SessionsService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext = {}) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { username: dto.username }] },
    });
    if (existing) {
      throw new BadRequestException('Email or username is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const memberRole = await this.prisma.role.upsert({
      where: { name: 'member' },
      update: {},
      create: { name: 'member', description: 'Default authenticated Obsidian user.' },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
        passwordHash,
        roles: { create: { roleId: memberRole.id } },
        notificationPreference: { create: {} },
      },
      include: this.userInclude(),
    });

    await this.auditService.record({
      userId: user.id,
      action: 'identity.register',
      entityType: 'User',
      entityId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: AuditSeverity.SECURITY,
    });

    const tokens = await this.issueTokens(user.id, user.email);
    await this.sessionsService.createForLogin(user.id, tokens.refreshTokenId, context);
    return this.authResponse(user, tokens);
  }

  async login(dto: LoginDto, context: RequestContext = {}) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: this.userInclude(),
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    await this.auditService.record({
      userId: user.id,
      action: 'identity.login',
      entityType: 'User',
      entityId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: AuditSeverity.SECURITY,
    });

    const sessionContext = {
      ...context,
      deviceName: dto.deviceName,
      deviceType: dto.deviceType,
      platform: dto.platform,
    };
    const tokens = await this.issueTokens(user.id, user.email);
    await this.sessionsService.createForLogin(user.id, tokens.refreshTokenId, sessionContext);
    return this.authResponse(user, tokens);
  }

  async refresh(refreshToken: string, context: RequestContext = {}) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: { user: { include: this.userInclude() } },
    });

    const session = await this.prisma.deviceSession.findUnique({
      where: { refreshTokenId: payload.jti },
    });

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt < new Date() ||
      session?.isRevoked
    ) {
      throw new UnauthorizedException('Refresh token is no longer valid.');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
    if (!tokenMatches || !tokenRecord.user.isActive) {
      throw new UnauthorizedException('Refresh token is no longer valid.');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(tokenRecord.user.id, tokenRecord.user.email);
    if (session) {
      await this.sessionsService.rotateRefreshToken(session.id, tokens.refreshTokenId, context);
    } else {
      await this.sessionsService.createForLogin(tokenRecord.user.id, tokens.refreshTokenId, context);
    }

    await this.auditService.record({
      userId: tokenRecord.user.id,
      action: 'identity.refresh',
      entityType: 'RefreshToken',
      entityId: tokens.refreshTokenId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: AuditSeverity.SECURITY,
    });

    return this.authResponse(tokenRecord.user, tokens);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: this.userInclude(),
    });
    return this.toSafeUser(user);
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('auth.accessSecret'),
        expiresIn: this.configService.get<string>('auth.accessExpiresIn'),
      },
    );

    const refreshTokenId = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, jti: refreshTokenId },
      {
        secret: this.configService.get<string>('auth.refreshSecret'),
        expiresIn: this.configService.get<string>('auth.refreshExpiresIn'),
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: this.refreshExpiryDate(),
      },
    });

    return { accessToken, refreshToken, refreshTokenId };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<{ sub: string; email: string; jti: string }>(refreshToken, {
        secret: this.configService.get<string>('auth.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private refreshExpiryDate() {
    const configured = this.configService.get<string>('auth.refreshExpiresIn') ?? '7d';
    const days = configured.endsWith('d') ? Number(configured.replace('d', '')) : 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private userInclude() {
    return {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
      applications: { include: { application: true } },
      notificationPreference: true,
      organizations: { include: { organization: true } },
      teams: { include: { team: true } },
    } as const;
  }

  private authResponse(
    user: IdentityUser,
    tokens: { accessToken: string; refreshToken: string; refreshTokenId: string },
  ) {
    return {
      user: this.toSafeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private toSafeUser(user: IdentityUser) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles,
      applications: user.applications,
      notificationPreference: user.notificationPreference,
      organizations: user.organizations,
      teams: user.teams,
    };
  }
}
