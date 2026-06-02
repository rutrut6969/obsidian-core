import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const applications = [
    ['Obsidian Wallet', 'wallet', 'Digital wallet and payments application.'],
    ['Obsidian Vault', 'vault', 'Secure storage and records application.'],
    ['Obsidian Family', 'family', 'Family coordination and shared account application.'],
    ['Obsidian Guardian', 'guardian', 'Safety, trust, and protection application.'],
    ['Obsidian Pulse', 'pulse', 'Insights, alerts, and activity application.'],
    ['Obsidian AI', 'ai', 'AI-assisted services across the Obsidian ecosystem.'],
  ];

  for (const [name, slug, description] of applications) {
    await prisma.application.upsert({
      where: { slug },
      update: { name, description, isActive: true },
      create: { name, slug, description },
    });
  }

  const permissions = [
    ['users:read', 'Read user profiles.'],
    ['users:update', 'Update user profiles.'],
    ['roles:manage', 'Create and manage roles.'],
    ['permissions:manage', 'Create and manage permissions.'],
    ['applications:manage', 'Create and manage ecosystem applications.'],
    ['notifications:send', 'Send notifications.'],
    ['audit:read', 'Read audit events.'],
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
