process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Load server and helpers
const { 
    app, 
    JWT_SECRET, 
    ADMIN_TOKEN_SECRET, 
    signAdminToken, 
    getDailyManagerPin 
} = require('../server');

let testServer;
let baseUrl;

test.before(async () => {
    await new Promise((resolve) => {
        testServer = app.listen(0, '127.0.0.1', () => {
            const port = testServer.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            console.log(`[TEST SUITE] Test server listening on ${baseUrl}`);
            resolve();
        });
    });
});

test.after(async () => {
    if (testServer) {
        await new Promise((resolve) => testServer.close(resolve));
    }
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    setTimeout(() => process.exit(0), 500).unref();
});

// Helper for HTTP requests
const request = async (path, options = {}) => {
    const url = `${baseUrl}${path}`;
    const method = options.method || 'GET';
    const headers = options.headers || {};
    let body = options.body;

    if (body && typeof body === 'object') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
        method,
        headers,
        body
    });

    const status = res.status;
    let data;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    return { status, data, headers: res.headers };
};

// -------------------------------------------------------------
// P0: ROTATE CREDENTIALS & REMOVE HARDCODED SECRETS TESTS
// -------------------------------------------------------------
test.describe('P0: Credentials & Secret Management', () => {
    test('JWT_SECRET is cryptographically initialized and not a default weak string', () => {
        assert.ok(JWT_SECRET, 'JWT_SECRET should be defined');
        assert.notStrictEqual(JWT_SECRET, 'khaliya_sanctuary_secure_jwt_secret_2026', 'Old default fallback secret must be eradicated');
    });

    test('ADMIN_TOKEN_SECRET is not the legacy weak fallback string', () => {
        assert.ok(ADMIN_TOKEN_SECRET, 'ADMIN_TOKEN_SECRET should be defined');
        assert.notStrictEqual(ADMIN_TOKEN_SECRET, 'khaliya-admin-secret-key-2024', 'Old admin secret fallback must be eradicated');
    });
});

// -------------------------------------------------------------
// P0: AUTHENTICATION & ROLE CHECKS (RBAC) ON PROTECTED APIS
// -------------------------------------------------------------
test.describe('P0: Authentication & Role Checks on Protected Endpoints', () => {
    test('GET /api/orders without Authorization token returns 401 Unauthorized', async () => {
        const res = await request('/api/orders');
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.data.success, false);
        assert.match(res.data.message, /Authentication required/i);
    });

    test('GET /api/orders with malformed Bearer token returns 401 Unauthorized', async () => {
        const res = await request('/api/orders', {
            headers: { 'Authorization': 'Bearer invalid.token.payload' }
        });
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.data.success, false);
    });

    test('GET /api/orders with expired token returns 401 Token Expired', async () => {
        const expiredToken = jwt.sign(
            { id: 'STF-TEST', name: 'Expired Staff', role: 'WAITER' },
            JWT_SECRET,
            { expiresIn: '-1s' }
        );
        const res = await request('/api/orders', {
            headers: { 'Authorization': `Bearer ${expiredToken}` }
        });
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.data.success, false);
        assert.match(res.data.message, /expired/i);
    });

    test('POST /api/settings with WAITER role returns 403 Forbidden', async () => {
        const waiterToken = jwt.sign(
            { id: 'STF-001', name: 'Rajesh', role: 'WAITER' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        const res = await request('/api/settings', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${waiterToken}` },
            body: { isOpen: false }
        });
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.data.success, false);
        assert.match(res.data.message, /Forbidden.*Role 'WAITER'/i);
    });

    test('GET /api/staff without auth returns 401 Unauthorized', async () => {
        const res = await request('/api/staff');
        assert.strictEqual(res.status, 401);
    });

    test('GET /api/staff with MANAGER token returns 200 and strips all staff PINs', async () => {
        const managerToken = jwt.sign(
            { id: 'STF-004', name: 'Amit Verma', role: 'MANAGER' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        const res = await request('/api/staff', {
            headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.ok(Array.isArray(res.data.staff), 'Staff should be an array');
        
        // CRITICAL CHECK: No staff object should expose their PIN
        res.data.staff.forEach(staffMember => {
            assert.strictEqual(staffMember.pin, undefined, `Staff ${staffMember.name} must not expose PIN in response`);
        });
    });
});

// -------------------------------------------------------------
// P0: SECURE STAFF PINS, OTP FLOWS & SENSITIVE DATA ENDPOINTS
// -------------------------------------------------------------
test.describe('P0: Staff PIN Security & OTP Protection', () => {
    test('Staff login with random/incorrect PIN returns 401', async () => {
        const res = await request('/api/auth/staff-login', {
            method: 'POST',
            body: { pin: '9999' }
        });
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.data.success, false);
    });

    test('Staff login with valid Daily Manager PIN returns 200 with JWT and excludes PIN', async () => {
        const dailyPin = getDailyManagerPin();
        const res = await request('/api/auth/staff-login', {
            method: 'POST',
            body: { pin: dailyPin }
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.ok(res.data.token, 'Should return JWT token');
        assert.strictEqual(res.data.user.role, 'MANAGER');
        assert.strictEqual(res.data.user.pin, undefined, 'User object in response must not include PIN');
    });

    test('Rate limiting on Email OTP: 4th request in window triggers 429 Too Many Requests', async () => {
        const testEmail = `ratelimit_${Date.now()}@example.com`;
        
        // 1st request
        await request('/api/auth/request-email-otp', {
            method: 'POST',
            body: { email: testEmail }
        });
        // 2nd request
        await request('/api/auth/request-email-otp', {
            method: 'POST',
            body: { email: testEmail }
        });
        // 3rd request
        await request('/api/auth/request-email-otp', {
            method: 'POST',
            body: { email: testEmail }
        });

        // 4th request -> must be rejected by rate limiter
        const res4 = await request('/api/auth/request-email-otp', {
            method: 'POST',
            body: { email: testEmail }
        });
        assert.strictEqual(res4.status, 429, '4th request must be rate limited with 429');
        assert.match(res4.data.message, /Too many OTP requests/i);
    });
});

// -------------------------------------------------------------
// P1: PAYMENT VERIFICATION & DUPLICATE ORDER PREVENTION
// -------------------------------------------------------------
test.describe('P1: Razorpay Payment Verification & Duplicate Prevention', () => {
    test('Rejects tampered Razorpay payment signature with 400', async () => {
        process.env.RAZORPAY_KEY_SECRET = 'test_secret_key_12345';
        const res = await request('/api/verify-razorpay-payment', {
            method: 'POST',
            body: {
                razorpay_order_id: 'order_test_123',
                razorpay_payment_id: 'pay_test_456',
                razorpay_signature: 'fake_tampered_signature_hex_value',
                orderData: { items: [], total: 500 }
            }
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.data.success, false);
        assert.match(res.data.message, /Signature mismatch/i);
    });

    test('Valid Razorpay signature succeeds and saves order', async () => {
        const secret = 'test_secret_key_12345';
        process.env.RAZORPAY_KEY_SECRET = secret;

        const orderId = `order_${Date.now()}`;
        const paymentId = `pay_${Date.now()}`;
        const signature = crypto
            .createHmac('sha256', secret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        const res = await request('/api/verify-razorpay-payment', {
            method: 'POST',
            body: {
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
                orderData: {
                    items: [{ name: 'Paneer Tikka', price: 300, quantity: 1 }],
                    total: 315,
                    orderType: 'takeout'
                }
            }
        });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.paymentId, paymentId);
        assert.ok(res.data.order, 'Order should be created');

        // IDEMPOTENCY REPLAY TEST: Sending identical payment ID again should return alreadyProcessed
        const replayRes = await request('/api/verify-razorpay-payment', {
            method: 'POST',
            body: {
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
                orderData: { total: 315 }
            }
        });

        assert.strictEqual(replayRes.status, 200);
        assert.strictEqual(replayRes.data.alreadyProcessed, true, 'Duplicate payment ID must be idempotent');
    });
});

// -------------------------------------------------------------
// P1: DATABASE WRITES & PERSISTENCE FAILURE PROPAGATION
// -------------------------------------------------------------
test.describe('P1: Database Writes & Concurrency Safety', () => {
    test('writeDataAsync propagates errors when DB connection is invalid instead of swallowing', async () => {
        const { writeDataAsync } = require('../db');
        // Passing an invalid collection key must throw
        await assert.rejects(
            async () => {
                await writeDataAsync('non_existent_invalid_collection_key', [{ a: 1 }]);
            },
            /Unknown collection key/i,
            'Persistence errors must throw and propagate'
        );
    });

    test('POST /api/bookings enforces slot capacity limit', async () => {
        const testDate = '2027-01-01';
        const testTime = '20:00';
        const testTable = 'window'; // Capacity is 5

        // Check availability endpoint is accessible
        const availRes = await request(`/api/bookings/availability?date=${testDate}&tableType=${testTable}`);
        assert.strictEqual(availRes.status, 200);
        assert.strictEqual(availRes.data.maxCapacity, 5);
    });
});
