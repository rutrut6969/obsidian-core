CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SECURITY');

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teams" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "team_members" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "device_sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" TEXT,
    "platform" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "refreshTokenId" TEXT,
    CONSTRAINT "device_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "application_permissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "applicationId" TEXT NOT NULL,
    "permissionName" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "application_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_application_permissions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "roleId" TEXT NOT NULL,
    "applicationPermissionId" TEXT NOT NULL,
    CONSTRAINT "role_application_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "platform_announcements" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_announcements_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "audit_logs" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "applicationId" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO';

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");
CREATE UNIQUE INDEX "teams_organizationId_name_key" ON "teams"("organizationId", "name");
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");
CREATE UNIQUE INDEX "device_sessions_refreshTokenId_key" ON "device_sessions"("refreshTokenId");
CREATE INDEX "device_sessions_userId_idx" ON "device_sessions"("userId");
CREATE UNIQUE INDEX "application_permissions_applicationId_permissionName_key" ON "application_permissions"("applicationId", "permissionName");
CREATE UNIQUE INDEX "role_application_permissions_roleId_applicationPermissionId_key" ON "role_application_permissions"("roleId", "applicationPermissionId");
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_refreshTokenId_fkey" FOREIGN KEY ("refreshTokenId") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "application_permissions" ADD CONSTRAINT "application_permissions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_application_permissions" ADD CONSTRAINT "role_application_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_application_permissions" ADD CONSTRAINT "role_application_permissions_applicationPermissionId_fkey" FOREIGN KEY ("applicationPermissionId") REFERENCES "application_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
