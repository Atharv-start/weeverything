const http = require('http');

console.log('WeEverything Real Payment Gateway & Webhook Test Suite');
console.log('======================================================');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1${path}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(resBody) });
          } catch {
            resolve({ statusCode: res.statusCode, data: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runPaymentTests() {
  let passed = 0;
  let failed = 0;

  console.log('\n═══ WEBHOOK SIGNATURE & IDEMPOTENCY ═══');

  // Test 1: Webhook endpoint accessible publicly & accepts valid signature
  try {
    const orderId = `order_sb_test_${Date.now()}`;
    const payload = {
      event: 'payment.captured',
      orderId: orderId,
      paymentId: `pay_sb_${Date.now()}`,
      amount: 50000,
      currency: 'INR',
    };

    const res = await post('/wallet/payment/webhook', payload, {
      'x-signature': 'sandbox_test_sig',
    });

    if ((res.statusCode === 200 || res.statusCode === 201) && res.data?.success === false && res.data?.data?.reason === 'Payment order not found') {
      console.log('✅ Webhook endpoint is publicly accessible and correctly processed signature');
      passed++;
    } else {
      console.log(`❌ Webhook failed with status ${res.statusCode}:`, res.data);
      failed++;
    }
  } catch (err) {
    console.log('❌ Webhook error:', err.message);
    failed++;
  }

  // Test 2: Reject Webhook with invalid signature
  try {
    const payload = {
      event: 'payment.captured',
      orderId: `order_sb_invalid`,
      amount: 50000,
    };

    const res = await post('/wallet/payment/webhook', payload, {
      'x-signature': 'invalid_forged_signature_123',
    });

    if ((res.statusCode === 200 || res.statusCode === 201) && res.data?.success === false && res.data?.data?.reason === 'Invalid HMAC signature') {
      console.log('✅ Webhook rejected invalid signature safely with failure response');
      passed++;
    } else {
      console.log('❌ Webhook failed to reject invalid signature:', res.data);
      failed++;
    }
  } catch (err) {
    console.log('❌ Invalid webhook error:', err.message);
    failed++;
  }

  console.log('\n═══════════════════════════════════');
  console.log('PAYMENT INTEGRATION TEST SUMMARY');
  console.log('═══════════════════════════════════');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
}

runPaymentTests().catch(console.error);
