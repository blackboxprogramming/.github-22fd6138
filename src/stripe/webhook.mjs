import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PORT = process.env.STRIPE_WEBHOOK_PORT || 4242;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FORWARD_URL = process.env.FORWARD_URL; // Pi endpoint to forward events to

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('STRIPE_WEBHOOK_SECRET is required');
  process.exit(1);
}

/**
 * Verify Stripe webhook signature (v1 scheme).
 * Does NOT require the stripe SDK — works with raw crypto.
 */
function verifySignature(payload, header, secret) {
  const parts = header.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key] = val;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) return false;

  // Reject if timestamp is older than 5 minutes (replay protection)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Event handlers keyed by Stripe event type
const handlers = {
  'checkout.session.completed': async (event) => {
    const session = event.data.object;
    console.log(`[checkout.session.completed] session=${session.id} customer=${session.customer} amount=${session.amount_total}`);
    return { handled: true, session_id: session.id };
  },

  'payment_intent.succeeded': async (event) => {
    const pi = event.data.object;
    console.log(`[payment_intent.succeeded] pi=${pi.id} amount=${pi.amount} currency=${pi.currency}`);
    return { handled: true, payment_intent: pi.id };
  },

  'payment_intent.payment_failed': async (event) => {
    const pi = event.data.object;
    const error = pi.last_payment_error?.message || 'unknown';
    console.error(`[payment_intent.payment_failed] pi=${pi.id} error=${error}`);
    return { handled: true, payment_intent: pi.id, error };
  },

  'customer.subscription.created': async (event) => {
    const sub = event.data.object;
    console.log(`[customer.subscription.created] sub=${sub.id} customer=${sub.customer} status=${sub.status}`);
    return { handled: true, subscription: sub.id };
  },

  'customer.subscription.deleted': async (event) => {
    const sub = event.data.object;
    console.log(`[customer.subscription.deleted] sub=${sub.id} customer=${sub.customer}`);
    return { handled: true, subscription: sub.id };
  },

  'invoice.payment_succeeded': async (event) => {
    const invoice = event.data.object;
    console.log(`[invoice.payment_succeeded] invoice=${invoice.id} amount=${invoice.amount_paid}`);
    return { handled: true, invoice: invoice.id };
  },

  'invoice.payment_failed': async (event) => {
    const invoice = event.data.object;
    console.error(`[invoice.payment_failed] invoice=${invoice.id} customer=${invoice.customer}`);
    return { handled: true, invoice: invoice.id };
  },
};

/**
 * Forward event to a downstream service (e.g. a Pi).
 */
async function forwardEvent(url, event) {
  const body = JSON.stringify(event);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Forward to ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.json().catch(() => ({}));
}

const server = createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'stripe-webhook' }));
    return;
  }

  // Only POST /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const sig = req.headers['stripe-signature'];
  if (!sig || !verifySignature(rawBody, sig, STRIPE_WEBHOOK_SECRET)) {
    console.error('[webhook] Invalid signature');
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid signature' }));
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  console.log(`[webhook] Received ${event.type} id=${event.id}`);

  // Route to handler
  const handler = handlers[event.type];
  let result = { handled: false, type: event.type };
  if (handler) {
    try {
      result = await handler(event);
    } catch (err) {
      console.error(`[webhook] Handler error for ${event.type}:`, err.message);
      result = { handled: false, error: err.message };
    }
  } else {
    console.log(`[webhook] No handler for ${event.type}, acknowledging`);
  }

  // Forward to Pi if configured
  if (FORWARD_URL) {
    try {
      await forwardEvent(FORWARD_URL, event);
      console.log(`[webhook] Forwarded ${event.type} to ${FORWARD_URL}`);
      result.forwarded = true;
    } catch (err) {
      console.error(`[webhook] Forward failed: ${err.message}`);
      result.forwarded = false;
      result.forward_error = err.message;
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ received: true, ...result }));
});

server.listen(PORT, () => {
  console.log(`Stripe webhook server listening on :${PORT}`);
  console.log(`Forward URL: ${FORWARD_URL || '(none — local processing only)'}`);
});

export { verifySignature, handlers, forwardEvent };
