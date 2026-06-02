import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { IdentityModule } from './modules/identity/identity.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TeamsModule } from './modules/teams/teams.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ApplicationPermissionsModule } from './modules/application-permissions/application-permissions.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig],
    }),
    JwtModule.register({}),
    PrismaModule,
    IdentityModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ApplicationsModule,
    NotificationsModule,
    AuditModule,
    HealthModule,
    OrganizationsModule,
    TeamsModule,
    SessionsModule,
    ApplicationPermissionsModule,
    FeatureFlagsModule,
    SystemSettingsModule,
    AnnouncementsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
