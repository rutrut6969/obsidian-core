import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.upsert({
    where: { slug: 'obsidian-systems' },
    update: {
      name: 'Obsidian Systems LLC',
      description: 'Parent organization for the Obsidian Systems ecosystem.',
      isActive: true,
    },
    create: {
      name: 'Obsidian Systems LLC',
      slug: 'obsidian-systems',
      description: 'Parent organization for the Obsidian Systems ecosystem.',
    },
  });

  const applications = [
    ['Obsidian Wallet', 'wallet', 'Digital wallet and payments application.'],
    ['Obsidian Vault', 'vault', 'Secure storage and records application.'],
    ['Obsidian Family', 'family', 'Family coordination and shared account application.'],
    ['Obsidian Guardian', 'guardian', 'Safety, trust, and protection application.'],
    ['Obsidian Pulse', 'pulse', 'Insights, alerts, and activity application.'],
    ['Obsidian AI', 'ai', 'AI-assisted services across the Obsidian ecosystem.'],
  ];

  const applicationRecords = new Map<string, { id: string; slug: string }>();
  for (const [name, slug, description] of applications) {
    const application = await prisma.application.upsert({
      where: { slug },
      update: { name, description, isActive: true },
      create: { name, slug, description },
    });
    applicationRecords.set(slug, application);
  }

  const permissions = [
    ['users:read', 'Read user profiles.'],
    ['users:update', 'Update user profiles.'],
    ['roles:manage', 'Create and manage roles.'],
    ['permissions:manage', 'Create and manage permissions.'],
    ['applications:manage', 'Create and manage ecosystem applications.'],
    ['application-permissions:read', 'Read application-scoped permissions.'],
    ['application-permissions:manage', 'Create and manage application-scoped permissions.'],
    ['notifications:send', 'Send notifications.'],
    ['audit:read', 'Read audit events.'],
    ['organizations:read', 'Read organizations.'],
    ['organizations:manage', 'Create and manage organizations.'],
    ['teams:read', 'Read teams.'],
    ['teams:manage', 'Create and manage teams.'],
    ['feature-flags:read', 'Read feature flags.'],
    ['feature-flags:manage', 'Create and manage feature flags.'],
    ['system-settings:read', 'Read system settings.'],
    ['system-settings:manage', 'Update system settings.'],
    ['announcements:read', 'Read platform announcements.'],
    ['announcements:manage', 'Create and manage platform announcements.'],
  ];

  const permissionRecords = [];
  for (const [name, description] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
    permissionRecords.push(permission);
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: { description: 'Full platform administration role.' },
    create: { name: 'super_admin', description: 'Full platform administration role.' },
  });

  await prisma.role.upsert({
    where: { name: 'member' },
    update: { description: 'Default authenticated Obsidian user.' },
    create: { name: 'member', description: 'Default authenticated Obsidian user.' },
  });

  for (const permission of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const applicationPermissions = [
    ['wallet', 'wallet.transactions.read', 'Read wallet transactions.'],
    ['wallet', 'wallet.transactions.write', 'Create and update wallet transactions.'],
    ['vault', 'vault.credentials.read', 'Read vault credentials.'],
    ['vault', 'vault.credentials.write', 'Create and update vault credentials.'],
    ['family', 'family.location.read', 'Read family location data.'],
    ['family', 'family.location.share', 'Share family location data.'],
    ['guardian', 'guardian.alerts.manage', 'Manage guardian alerts.'],
    ['pulse', 'pulse.insights.read', 'Read Pulse insights.'],
    ['ai', 'ai.assistant.use', 'Use Obsidian AI assistant capabilities.'],
  ];

  for (const [applicationSlug, permissionName, description] of applicationPermissions) {
    const application = applicationRecords.get(applicationSlug);
    if (!application) {
      continue;
    }

    const applicationPermission = await prisma.applicationPermission.upsert({
      where: {
        applicationId_permissionName: {
          applicationId: application.id,
          permissionName,
        },
      },
      update: { description },
      create: {
        applicationId: application.id,
        permissionName,
        description,
      },
    });

    await prisma.roleApplicationPermission.upsert({
      where: {
        roleId_applicationPermissionId: {
          roleId: superAdminRole.id,
          applicationPermissionId: applicationPermission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        applicationPermissionId: applicationPermission.id,
      },
    });
  }

  const featureFlags = [
    ['wallet.enabled', 'Controls availability of Obsidian Wallet.', true],
    ['vault.enabled', 'Controls availability of Obsidian Vault.', true],
    ['family.enabled', 'Controls availability of Obsidian Family.', true],
    ['guardian.enabled', 'Controls availability of Obsidian Guardian.', true],
    ['pulse.enabled', 'Controls availability of Obsidian Pulse.', true],
    ['ai.enabled', 'Controls availability of Obsidian AI.', true],
  ] as const;

  for (const [key, description, enabled] of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key },
      update: { description, enabled },
      create: { key, description, enabled },
    });
  }

  await prisma.systemSetting.upsert({
    where: { key: 'platform.maintenance' },
    update: {
      value: { enabled: false },
      description: 'Controls platform-wide maintenance mode.',
    },
    create: {
      key: 'platform.maintenance',
      value: { enabled: false },
      description: 'Controls platform-wide maintenance mode.',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
