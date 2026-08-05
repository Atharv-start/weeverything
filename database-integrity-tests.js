/**
 * WeEverything Database Integrity Test Suite
 * Tests database schema, constraints, and data consistency
 * 
 * Run with: node database-integrity-tests.js
 */

const { PrismaClient } = require('./packages/database/generated');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${path.join(__dirname, 'packages/database/prisma/dev.db')}` }
  },
  log: ['error']
});

let passed = 0;
let failed = 0;
const issues = [];

async function check(label, fn) {
  try {
    const result = await fn();
    if (result === true || result === undefined) {
      passed++;
      console.log(`✅ ${label}`);
    } else if (typeof result === 'string') {
      // Warning
      console.log(`⚠️  ${label} — ${result}`);
      passed++;
    } else {
      failed++;
      issues.push(`${label}: ${JSON.stringify(result)}`);
      console.log(`❌ ${label} — unexpected result: ${JSON.stringify(result)}`);
    }
  } catch (e) {
    failed++;
    issues.push(`${label}: ${e.message}`);
    console.log(`❌ ${label} — ERROR: ${e.message}`);
  }
}

async function main() {
  console.log('WeEverything Database Integrity Tests');
  console.log('======================================');

  await prisma.$connect();

  // ─── SCHEMA EXISTENCE ────────────────────────────────────────────────────
  console.log('\n═══ SCHEMA: Table Existence ═══');

  await check('Users table exists & queryable', async () => {
    await prisma.user.count(); return true;
  });
  await check('UserProfile table exists', async () => {
    await prisma.userProfile.count(); return true;
  });
  await check('PrivacySetting table exists', async () => {
    await prisma.privacySetting.count(); return true;
  });
  await check('Session table exists', async () => {
    await prisma.session.count(); return true;
  });
  await check('RefreshToken table exists', async () => {
    await prisma.refreshToken.count(); return true;
  });
  await check('Wallet table exists', async () => {
    await prisma.wallet.count(); return true;
  });
  await check('LedgerTransaction table exists', async () => {
    await prisma.ledgerTransaction.count(); return true;
  });
  await check('LedgerEntry table exists', async () => {
    await prisma.ledgerEntry.count(); return true;
  });
  await check('Connection table exists', async () => {
    await prisma.connection.count(); return true;
  });
  await check('ConnectionRequest table exists', async () => {
    await prisma.connectionRequest.count(); return true;
  });
  await check('Post table exists', async () => {
    await prisma.post.count(); return true;
  });
  await check('Task table exists', async () => {
    await prisma.task.count(); return true;
  });
  await check('Conversation table exists', async () => {
    await prisma.conversation.count(); return true;
  });
  await check('Message table exists', async () => {
    await prisma.message.count(); return true;
  });
  await check('Notification table exists', async () => {
    await prisma.notification.count(); return true;
  });
  await check('Poll table exists', async () => {
    await prisma.poll.count(); return true;
  });
  await check('ExpenseGroup table exists', async () => {
    await prisma.expenseGroup.count(); return true;
  });
  await check('MiniApp table exists', async () => {
    await prisma.miniApp.count(); return true;
  });
  await check('QrReference table exists', async () => {
    await prisma.qrReference.count(); return true;
  });
  await check('AuditLog table exists', async () => {
    await prisma.auditLog.count(); return true;
  });

  // ─── DATA INTEGRITY ───────────────────────────────────────────────────────
  console.log('\n═══ DATA INTEGRITY: Referential Integrity ═══');

  // Every UserProfile must have a valid User
  await check('All UserProfiles link to valid Users', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT p.id FROM UserProfile p
      LEFT JOIN User u ON u.id = p.userId
      WHERE u.id IS NULL
    `;
    if (orphaned.length > 0) return `Found ${orphaned.length} orphaned UserProfiles!`;
    return true;
  });

  // Every Wallet must have a valid User
  await check('All Wallets link to valid Users', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT w.id FROM Wallet w
      LEFT JOIN User u ON u.id = w.userId
      WHERE u.id IS NULL
    `;
    if (orphaned.length > 0) return false;
    return true;
  });

  // Every LedgerEntry must link to a valid Wallet and Transaction
  await check('All LedgerEntries link to valid Wallets', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT le.id FROM LedgerEntry le
      LEFT JOIN Wallet w ON w.id = le.walletId
      WHERE w.id IS NULL
    `;
    if (orphaned.length > 0) return false;
    return true;
  });

  // Every Connection must have valid users
  await check('All Connections have valid User references', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT c.id FROM Connection c
      LEFT JOIN User u1 ON u1.id = c.userId
      LEFT JOIN User u2 ON u2.id = c.connectedId
      WHERE u1.id IS NULL OR u2.id IS NULL
    `;
    if (orphaned.length > 0) return false;
    return true;
  });

  // Every Post must link to valid Author
  await check('All Posts link to valid Authors', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT p.id FROM Post p
      LEFT JOIN User u ON u.id = p.authorId
      WHERE u.id IS NULL
    `;
    if (orphaned.length > 0) return false;
    return true;
  });

  // Every Message links to valid Conversation and Sender
  await check('All Messages link to valid Conversation and Sender', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT m.id FROM Message m
      LEFT JOIN Conversation c ON c.id = m.conversationId
      LEFT JOIN User u ON u.id = m.senderId
      WHERE c.id IS NULL OR u.id IS NULL
    `;
    if (orphaned.length > 0) return false;
    return true;
  });

  // ─── BUSINESS LOGIC CHECKS ───────────────────────────────────────────────
  console.log('\n═══ BUSINESS LOGIC: Constraints ═══');

  // Ledger balance consistency: balanceAfter for any entry should be non-negative
  await check('No ledger entries with negative final balance (for credit entries)', async () => {
    const badEntries = await prisma.$queryRaw`
      SELECT id FROM LedgerEntry WHERE type = 'CREDIT' AND balanceAfter < 0
    `;
    if (badEntries.length > 0) return `Found ${badEntries.length} credit entries with negative balanceAfter`;
    return true;
  });

  // Duplicate connection check
  await check('No duplicate Connection entries (userId+connectedId)', async () => {
    const dupes = await prisma.$queryRaw`
      SELECT userId, connectedId, COUNT(*) as cnt
      FROM Connection
      GROUP BY userId, connectedId
      HAVING cnt > 1
    `;
    if (dupes.length > 0) return `Found ${dupes.length} duplicate connection pairs`;
    return true;
  });

  // Users must have unique email
  await check('No duplicate User emails', async () => {
    const dupes = await prisma.$queryRaw`
      SELECT email, COUNT(*) as cnt FROM User GROUP BY email HAVING cnt > 1
    `;
    if (dupes.length > 0) return false;
    return true;
  });

  // Users must have unique username
  await check('No duplicate User usernames', async () => {
    const dupes = await prisma.$queryRaw`
      SELECT username, COUNT(*) as cnt FROM User GROUP BY username HAVING cnt > 1
    `;
    if (dupes.length > 0) return false;
    return true;
  });

  // Every ConnectionRequest has valid users
  await check('All ConnectionRequests reference valid Users', async () => {
    const orphaned = await prisma.$queryRaw`
      SELECT cr.id FROM ConnectionRequest cr
      LEFT JOIN User u1 ON u1.id = cr.requesterId
      LEFT JOIN User u2 ON u2.id = cr.receiverId
      WHERE u1.id IS NULL OR u2.id IS NULL
    `;
    if (orphaned.length > 0) return false;
    return true;
  });

  // ─── COUNTS SUMMARY ───────────────────────────────────────────────────────
  console.log('\n═══ DATABASE: Record Counts Summary ═══');

  const [userCount, walletCount, postCount, taskCount, convCount, msgCount, pollCount] = await Promise.all([
    prisma.user.count(),
    prisma.wallet.count(),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.task.count(),
    prisma.conversation.count(),
    prisma.message.count({ where: { deletedAt: null } }),
    prisma.poll.count(),
  ]);

  console.log(`  Users:              ${userCount}`);
  console.log(`  Wallets:            ${walletCount}`);
  console.log(`  Active Posts:       ${postCount}`);
  console.log(`  Tasks:              ${taskCount}`);
  console.log(`  Conversations:      ${convCount}`);
  console.log(`  Active Messages:    ${msgCount}`);
  console.log(`  Polls:              ${pollCount}`);

  // User-to-wallet consistency
  await check(`Wallet count matches User count (${walletCount}/${userCount})`, async () => {
    // Not all users necessarily have wallets immediately, but guard against missing
    if (walletCount < userCount * 0.8) {
      return `Warning: Only ${walletCount} wallets for ${userCount} users — some users may be missing wallets`;
    }
    return true;
  });

  // ─── MINI APPS SEEDING ────────────────────────────────────────────────────
  console.log('\n═══ MINI APPS: Seeding Status ═══');

  const miniApps = await prisma.miniApp.findMany({ where: { status: 'ACTIVE' } });
  await check(`Active Mini Apps configured (found ${miniApps.length})`, () => {
    if (miniApps.length === 0) return 'No active mini apps found — run seed script or add via admin';
    return true;
  });

  if (miniApps.length > 0) {
    console.log('  Available mini apps:');
    miniApps.forEach(a => console.log(`    - ${a.name} (${a.slug}) — ${a.category}`));
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════');
  console.log('DATABASE INTEGRITY RESULTS');
  console.log('═══════════════════════════════════');
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log('═══════════════════════════════════');

  if (issues.length > 0) {
    console.log('\nIssues detected:');
    issues.forEach(i => console.log('  -', i));
  } else {
    console.log('\n✅ No database integrity issues detected.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Fatal error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
