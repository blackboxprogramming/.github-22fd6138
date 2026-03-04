/**
 * Stripe payment operations.
 * Requires STRIPE_SECRET_KEY env var.
 */

let stripe;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is required');
    // Dynamic import handled at call site — this module works with or without the SDK
    stripe = { apiKey: key };
  }
  return stripe;
}

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(method, path, params = {}) {
  const { apiKey } = getStripe();
  const url = `${STRIPE_API}${path}`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = method === 'GET'
    ? undefined
    : new URLSearchParams(flattenParams(params)).toString();

  const fullUrl = method === 'GET' && Object.keys(params).length
    ? `${url}?${new URLSearchParams(flattenParams(params)).toString()}`
    : url;

  const res = await fetch(fullUrl, { method, headers, body });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe ${method} ${path}: ${data.error?.message || res.statusText}`);
  }
  return data;
}

/** Flatten nested params for Stripe's form encoding (e.g. metadata[key]=val) */
function flattenParams(obj, prefix = '') {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(result, flattenParams(val, fullKey));
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

// --- Public API ---

export async function createCheckoutSession({ priceId, successUrl, cancelUrl, metadata = {} }) {
  return stripeRequest('POST', '/checkout/sessions', {
    mode: 'payment',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function createSubscription({ customerId, priceId, metadata = {} }) {
  return stripeRequest('POST', '/subscriptions', {
    customer: customerId,
    'items[0][price]': priceId,
    metadata,
  });
}

export async function cancelSubscription(subscriptionId) {
  return stripeRequest('DELETE', `/subscriptions/${subscriptionId}`);
}

export async function getPaymentIntent(paymentIntentId) {
  return stripeRequest('GET', `/payment_intents/${paymentIntentId}`);
}

export async function listPayments({ customerId, limit = 10 }) {
  const params = { limit };
  if (customerId) params.customer = customerId;
  return stripeRequest('GET', '/payment_intents', params);
}

export async function createCustomer({ email, name, metadata = {} }) {
  return stripeRequest('POST', '/customers', { email, name, metadata });
}

export async function getCustomer(customerId) {
  return stripeRequest('GET', `/customers/${customerId}`);
}

export { flattenParams };
