import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';

const WEBHOOK_SECRET = 'whsec_test_secret_for_e2e';
const WEBHOOK_PORT = 14242;

// Set env before importing webhook module
process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.STRIPE_WEBHOOK_PORT = String(WEBHOOK_PORT);

// Helper: build a valid Stripe signature header
function makeSignature(payload, secret, timestamp) {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', secret)
    .update(`${ts}.${payload}`)
    .digest('hex');
  return `t=${ts},v1=${sig}`;
}

// Helper: POST to webhook server
async function postWebhook(body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  const sig = headers['stripe-signature'] || makeSignature(payload, WEBHOOK_SECRET);
  const res = await fetch(`http://127.0.0.1:${WEBHOOK_PORT}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': sig,
      ...headers,
    },
    body: payload,
  });
  return { status: res.status, body: await res.json() };
}

// --- Unit tests for verifySignature ---

import { verifySignature } from '../src/stripe/webhook.mjs';

describe('Stripe Signature Verification', () => {
  it('accepts a valid signature', () => {
    const payload = '{"id":"evt_test"}';
    const ts = Math.floor(Date.now() / 1000);
    const sig = createHmac('sha256', WEBHOOK_SECRET)
      .update(`${ts}.${payload}`)
      .digest('hex');
    const header = `t=${ts},v1=${sig}`;

    assert.equal(verifySignature(payload, header, WEBHOOK_SECRET), true);
  });

  it('rejects an invalid signature', () => {
    const payload = '{"id":"evt_test"}';
    const header = `t=${Math.floor(Date.now() / 1000)},v1=invalidsig`;

    assert.equal(verifySignature(payload, header, WEBHOOK_SECRET), false);
  });

  it('rejects a replayed event (>5 min old)', () => {
    const payload = '{"id":"evt_test"}';
    const oldTs = Math.floor(Date.now() / 1000) - 600; // 10 min ago
    const sig = createHmac('sha256', WEBHOOK_SECRET)
      .update(`${oldTs}.${payload}`)
      .digest('hex');
    const header = `t=${oldTs},v1=${sig}`;

    assert.equal(verifySignature(payload, header, WEBHOOK_SECRET), false);
  });

  it('rejects missing v1 field', () => {
    const payload = '{"id":"evt_test"}';
    const header = `t=${Math.floor(Date.now() / 1000)}`;

    assert.equal(verifySignature(payload, header, WEBHOOK_SECRET), false);
  });
});

// --- E2E webhook server tests ---

describe('Stripe Webhook E2E', () => {
  // The webhook server was already started by the import — wait for it
  before(async () => {
    // Give the server a moment to bind
    await new Promise((r) => setTimeout(r, 500));
  });

  after(() => {
    // node:test will exit after tests complete
    process.exit(0);
  });

  it('GET /health returns 200', async () => {
    const res = await fetch(`http://127.0.0.1:${WEBHOOK_PORT}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'stripe-webhook');
  });

  it('rejects unsigned POST', async () => {
    const res = await fetch(`http://127.0.0.1:${WEBHOOK_PORT}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"type":"test"}',
    });
    assert.equal(res.status, 400);
  });

  it('rejects invalid signature', async () => {
    const { status, body } = await postWebhook(
      { type: 'test', id: 'evt_bad' },
      { 'stripe-signature': 't=123,v1=badsig' },
    );
    assert.equal(status, 400);
    assert.equal(body.error, 'Invalid signature');
  });

  it('handles checkout.session.completed', async () => {
    const event = {
      id: 'evt_checkout_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_456',
          amount_total: 2999,
        },
      },
    };
    const { status, body } = await postWebhook(event);
    assert.equal(status, 200);
    assert.equal(body.received, true);
    assert.equal(body.handled, true);
    assert.equal(body.session_id, 'cs_test_123');
  });

  it('handles payment_intent.succeeded', async () => {
    const event = {
      id: 'evt_pi_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_789',
          amount: 5000,
          currency: 'usd',
        },
      },
    };
    const { status, body } = await postWebhook(event);
    assert.equal(status, 200);
    assert.equal(body.handled, true);
    assert.equal(body.payment_intent, 'pi_test_789');
  });

  it('handles payment_intent.payment_failed', async () => {
    const event = {
      id: 'evt_pi_fail',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_fail',
          amount: 1000,
          currency: 'usd',
          last_payment_error: { message: 'Card declined' },
        },
      },
    };
    const { status, body } = await postWebhook(event);
    assert.equal(status, 200);
    assert.equal(body.handled, true);
    assert.equal(body.error, 'Card declined');
  });

  it('handles customer.subscription.created', async () => {
    const event = {
      id: 'evt_sub_1',
      type: 'customer.subscription.created',
      data: {
        object: { id: 'sub_test_abc', customer: 'cus_123', status: 'active' },
      },
    };
    const { status, body } = await postWebhook(event);
    assert.equal(status, 200);
    assert.equal(body.handled, true);
    assert.equal(body.subscription, 'sub_test_abc');
  });

  it('handles invoice.payment_succeeded', async () => {
    const event = {
      id: 'evt_inv_1',
      type: 'invoice.payment_succeeded',
      data: {
        object: { id: 'in_test_001', amount_paid: 4999 },
      },
    };
    const { status, body } = await postWebhook(event);
    assert.equal(status, 200);
    assert.equal(body.handled, true);
    assert.equal(body.invoice, 'in_test_001');
  });

  it('acknowledges unknown event types', async () => {
    const event = {
      id: 'evt_unknown',
      type: 'some.unknown.event',
      data: { object: {} },
    };
    const { status, body } = await postWebhook(event);
    assert.equal(status, 200);
    assert.equal(body.received, true);
    assert.equal(body.handled, false);
  });

  it('forwards events to FORWARD_URL when configured', async () => {
    // Spin up a mock Pi endpoint
    let receivedEvent = null;
    const piServer = createServer((req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        receivedEvent = JSON.parse(Buffer.concat(chunks).toString());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      });
    });

    await new Promise((resolve) => piServer.listen(14243, resolve));
    process.env.FORWARD_URL = 'http://127.0.0.1:14243';

    try {
      const event = {
        id: 'evt_forward_test',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_fwd', amount: 100, currency: 'usd' } },
      };
      const { status, body } = await postWebhook(event);
      assert.equal(status, 200);
      assert.equal(body.forwarded, true);
      assert.deepEqual(receivedEvent, event);
    } finally {
      delete process.env.FORWARD_URL;
      piServer.close();
    }
  });
});
