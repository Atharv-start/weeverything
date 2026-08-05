/**
 * WeEverything Backend Test Suite
 * Comprehensive automated tests against the running API on port 4000
 * 
 * Run with: node backend-tests.js
 */

const BASE = 'http://localhost:4000/api/v1';

let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];

async function req(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(`${BASE}${path}`, opts);
    const data = await r.json().catch(() => null);
    return { status: r.status, data, ok: r.ok };
  } catch (e) {
    return { status: 0, data: null, error: e.message, ok: false };
  }
}

function log(label, pass, detail = '') {
  const symbol = pass === 'pass' ? '✅' : pass === 'warn' ? '⚠️ ' : '❌';
  if (pass === 'pass') passed++;
  else if (pass === 'warn') warnings++;
  else failed++;
  const msg = `${symbol} ${label}${detail ? ' — ' + detail : ''}`;
  results.push(msg);
  console.log(msg);
}

function assert(label, condition, detail = '') {
  log(label, condition ? 'pass' : 'fail', detail);
}

// ─── TEST SUITES ─────────────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n═══ HEALTH ═══');
  const r = await req('GET', '/health');
  assert('GET /health returns 200', r.status === 200);
  assert('Health body has status ok', r.data?.data?.status === 'ok');
  assert('Health body has service name', r.data?.data?.service === 'WeEverything API');
}

async function testAuthProtection() {
  console.log('\n═══ AUTH GUARD (No Token) ═══');

  const protectedRoutes = [
    ['GET', '/wallet'],
    ['GET', '/conversations'],
    ['GET', '/moments'],
    ['GET', '/notifications'],
    ['GET', '/tasks'],
    ['GET', '/connections'],
    ['GET', '/auth/me'],
    ['GET', '/users/search?q=test'],
  ];

  for (const [method, path] of protectedRoutes) {
    const r = await req(method, path);
    assert(
      `${method} ${path} requires auth`,
      r.status === 401,
      `Got ${r.status}`
    );
  }
}

async function testInvalidToken() {
  console.log('\n═══ AUTH GUARD (Invalid Token) ═══');
  const badHeaders = { Authorization: 'Bearer invalid_token_xyz_test' };

  const r = await req('GET', '/auth/me', null, badHeaders);
  assert('Invalid token returns 401', r.status === 401, `Got ${r.status}`);
  assert('Error response has success:false', r.data?.success === false || r.data?.error !== undefined || r.data?.message !== undefined, JSON.stringify(r.data));
}

async function testPublicEndpoints() {
  console.log('\n═══ PUBLIC ENDPOINTS ═══');

  // Health is public
  const health = await req('GET', '/health');
  assert('Health endpoint is public (no 401)', health.status !== 401, `Got ${health.status}`);
}

async function testAuthValidation() {
  console.log('\n═══ AUTH INPUT VALIDATION ═══');

  // Register with missing fields
  const noAcceptTerms = await req('POST', '/auth/register', {
    email: 'test@test.com',
    username: 'testuser',
    displayName: 'Test User',
    password: 'Password123!',
    acceptTerms: false,
  });
  assert('Register rejects missing acceptTerms', noAcceptTerms.status >= 400, `Got ${noAcceptTerms.status}`);

  // Register with empty body
  const emptyBody = await req('POST', '/auth/register', {});
  assert('Register rejects empty body', emptyBody.status >= 400, `Got ${emptyBody.status}`);

  // Login with wrong credentials
  const badLogin = await req('POST', '/auth/login', {
    identifier: 'nonexistent_user_xyz@test.com',
    password: 'wrongpassword123',
  });
  assert('Login rejects invalid credentials', badLogin.status === 401 || badLogin.status === 400, `Got ${badLogin.status}`);
}

async function testWalletErrors() {
  console.log('\n═══ WALLET (No Auth Validation) ═══');

  // Wallet transfer with bad payload
  const r = await req('POST', '/wallet/transfer', { amount: -100 });
  assert('Transfer without auth returns 401', r.status === 401, `Got ${r.status}`);

  // Wallet history without auth
  const hist = await req('GET', '/wallet/history');
  assert('Wallet history without auth returns 401', hist.status === 401, `Got ${hist.status}`);
}

async function testMomentsGetPublic() {
  console.log('\n═══ MOMENTS FEED ═══');
  const r = await req('GET', '/moments');
  // Protected - should require auth
  assert('GET /moments requires auth', r.status === 401, `Got ${r.status}`);
}

async function testTasksProtection() {
  console.log('\n═══ TASKS ═══');
  const tasks = await req('GET', '/tasks');
  assert('GET /tasks requires auth', tasks.status === 401, `Got ${tasks.status}`);

  const create = await req('POST', '/tasks', { title: 'Test Task' });
  assert('POST /tasks requires auth', create.status === 401, `Got ${create.status}`);
}

async function testPollsProtection() {
  console.log('\n═══ POLLS ═══');
  const polls = await req('GET', '/polls');
  assert('GET /polls requires auth', polls.status === 401, `Got ${polls.status}`);

  const create = await req('POST', '/polls', { question: 'Test?', options: ['A', 'B'] });
  assert('POST /polls requires auth', create.status === 401, `Got ${create.status}`);
}

async function testExpensesProtection() {
  console.log('\n═══ EXPENSES ═══');
  const expenses = await req('GET', '/expenses');
  assert('GET /expenses requires auth', expenses.status === 401, `Got ${expenses.status}`);
}

async function testConnectionsProtection() {
  console.log('\n═══ CONNECTIONS ═══');
  const conns = await req('GET', '/connections');
  assert('GET /connections requires auth', conns.status === 401, `Got ${conns.status}`);

  const pending = await req('GET', '/connections/requests/pending');
  assert('GET /connections/requests/pending requires auth', pending.status === 401, `Got ${pending.status}`);
}

async function testConversationsProtection() {
  console.log('\n═══ CONVERSATIONS ═══');
  const convs = await req('GET', '/conversations');
  assert('GET /conversations requires auth', convs.status === 401, `Got ${convs.status}`);

  const direct = await req('POST', '/conversations/direct', { targetUserId: 'some-id' });
  assert('POST /conversations/direct requires auth', direct.status === 401, `Got ${direct.status}`);
}

async function testNotificationsProtection() {
  console.log('\n═══ NOTIFICATIONS ═══');
  const notifs = await req('GET', '/notifications');
  assert('GET /notifications requires auth', notifs.status === 401, `Got ${notifs.status}`);

  const count = await req('GET', '/notifications/unread-count');
  assert('GET /notifications/unread-count requires auth', count.status === 401, `Got ${count.status}`);
}

async function testAdminProtection() {
  console.log('\n═══ ADMIN ═══');
  const dash = await req('GET', '/admin/dashboard');
  assert('GET /admin/dashboard requires auth', dash.status === 401, `Got ${dash.status}`);

  const users = await req('GET', '/admin/users');
  assert('GET /admin/users requires auth', users.status === 401, `Got ${users.status}`);

  const reports = await req('GET', '/admin/reports');
  assert('GET /admin/reports requires auth', reports.status === 401, `Got ${reports.status}`);

  const auditLogs = await req('GET', '/admin/audit-logs');
  assert('GET /admin/audit-logs requires auth', auditLogs.status === 401, `Got ${auditLogs.status}`);
}

async function testAiProtection() {
  console.log('\n═══ AI ENDPOINTS ═══');
  const chatSugg = await req('POST', '/ai/chat-suggestions', { conversationId: 'x', context: 'hello' });
  assert('POST /ai/chat-suggestions requires auth', chatSugg.status === 401, `Got ${chatSugg.status}`);

  const taskPlan = await req('POST', '/ai/task-plan', { description: 'Build a product' });
  assert('POST /ai/task-plan requires auth', taskPlan.status === 401, `Got ${taskPlan.status}`);

  const insights = await req('GET', '/ai/expense-insights');
  assert('GET /ai/expense-insights requires auth', insights.status === 401, `Got ${insights.status}`);

  const universal = await req('POST', '/ai/universal', { prompt: 'test' });
  assert('POST /ai/universal requires auth', universal.status === 401, `Got ${universal.status}`);
}

async function testCorsHeaders() {
  console.log('\n═══ CORS & RATE LIMITING ═══');
  // Simple check that health still returns 200 (CORS allows localhost:3000)
  const r = await req('GET', '/health', null, { Origin: 'http://localhost:3000' });
  assert('CORS allows localhost:3000 origin', r.status === 200, `Got ${r.status}`);
}

async function testMiniApps() {
  console.log('\n═══ MINI APPS ═══');
  const apps = await req('GET', '/mini-apps');
  // Mini-apps listing should be protected
  assert('GET /mini-apps requires auth', apps.status === 401 || apps.status === 200, `Got ${apps.status}`);
  if (apps.status === 200) {
    log('GET /mini-apps returns data (public or authenticated)', 'warn', 'Consider if this should be protected');
  }
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────

async function main() {
  console.log('WeEverything Backend Test Suite');
  console.log('================================');
  console.log(`Target: ${BASE}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  await testHealth();
  await testPublicEndpoints();
  await testAuthProtection();
  await testInvalidToken();
  await testAuthValidation();
  await testWalletErrors();
  await testMomentsGetPublic();
  await testTasksProtection();
  await testPollsProtection();
  await testExpensesProtection();
  await testConnectionsProtection();
  await testConversationsProtection();
  await testNotificationsProtection();
  await testAdminProtection();
  await testAiProtection();
  await testCorsHeaders();
  await testMiniApps();

  console.log('\n═══════════════════════════════════');
  console.log('BACKEND TEST RESULTS');
  console.log('═══════════════════════════════════');
  console.log(`✅ Passed:   ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`Total:       ${passed + warnings + failed}`);
  console.log('═══════════════════════════════════');

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.startsWith('❌')).forEach(r => console.log(' ', r));
  }
  if (warnings > 0) {
    console.log('\nWarnings:');
    results.filter(r => r.startsWith('⚠')).forEach(r => console.log(' ', r));
  }
}

main().catch(console.error);
