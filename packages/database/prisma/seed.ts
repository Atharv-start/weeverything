import { PrismaClient } from '../generated';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding WeEverything development database...');

  const passwordHash = await argon2.hash('Password123!', { type: argon2.argon2id });

  // Create super admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@weeverything.dev' },
    update: {},
    create: {
      email: 'admin@weeverything.dev',
      username: 'admin',
      displayName: 'WeEverything Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      profile: { create: { bio: 'Platform administrator' } },
      privacySetting: { create: {} },
      wallet: { create: {} },
    },
  });

  // Create demo users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@weeverything.dev' },
    update: {},
    create: {
      email: 'alice@weeverything.dev',
      username: 'alice',
      displayName: 'Alice Chen',
      passwordHash,
      emailVerified: true,
      profile: { create: { bio: 'Product designer & coffee enthusiast ☕' } },
      privacySetting: { create: {} },
      wallet: { create: {} },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@weeverything.dev' },
    update: {},
    create: {
      email: 'bob@weeverything.dev',
      username: 'bob',
      displayName: 'Bob Kumar',
      passwordHash,
      emailVerified: true,
      profile: { create: { bio: 'Software engineer | WeEverything enthusiast' } },
      privacySetting: { create: {} },
      wallet: { create: {} },
    },
  });

  // Seed Mini Apps registry
  await prisma.miniApp.upsert({
    where: { slug: 'tasks' },
    update: {},
    create: {
      slug: 'tasks',
      name: 'Task Manager',
      description: 'Create, organize, and track your tasks with priorities and due dates.',
      icon: '✅',
      category: 'Productivity',
      route: '/mini-apps/tasks',
      status: 'ACTIVE',
      order: 1,
    },
  });

  await prisma.miniApp.upsert({
    where: { slug: 'expenses' },
    update: {},
    create: {
      slug: 'expenses',
      name: 'Expense Splitter',
      description: 'Split bills equally, by exact amounts, or by percentage with your group.',
      icon: '💸',
      category: 'Finance',
      route: '/mini-apps/expenses',
      status: 'ACTIVE',
      order: 2,
    },
  });

  await prisma.miniApp.upsert({
    where: { slug: 'polls' },
    update: {},
    create: {
      slug: 'polls',
      name: 'Polls',
      description: 'Create polls with live results and anonymous voting options.',
      icon: '📊',
      category: 'Social',
      route: '/mini-apps/polls',
      status: 'ACTIVE',
      order: 3,
    },
  });

  // Seed wallet balances for demo users
  const [aliceWallet, bobWallet] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: alice.id } }),
    prisma.wallet.findUnique({ where: { userId: bob.id } }),
  ]);

  if (aliceWallet) {
    await prisma.ledgerTransaction.create({
      data: {
        idempotencyKey: `seed_alice_${Date.now()}`,
        description: 'Development seed balance',
        totalAmount: 500000,
        entries: {
          create: [{
            walletId: aliceWallet.id,
            type: 'CREDIT',
            amount: 500000,
            balanceAfter: 500000,
            description: 'Seed balance (₹5,000.00)',
          }],
        },
      },
    }).catch(() => {}); // Ignore if already seeded
  }

  if (bobWallet) {
    await prisma.ledgerTransaction.create({
      data: {
        idempotencyKey: `seed_bob_${Date.now()}`,
        description: 'Development seed balance',
        totalAmount: 300000,
        entries: {
          create: [{
            walletId: bobWallet.id,
            type: 'CREDIT',
            amount: 300000,
            balanceAfter: 300000,
            description: 'Seed balance (₹3,000.00)',
          }],
        },
      },
    }).catch(() => {});
  }

  console.log('✅ Seed complete!');
  console.log('Demo accounts (password: Password123!):');
  console.log('  admin@weeverything.dev (SUPER_ADMIN)');
  console.log('  alice@weeverything.dev (USER)');
  console.log('  bob@weeverything.dev (USER)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
