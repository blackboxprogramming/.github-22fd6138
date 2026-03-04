import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { flattenParams } from '../src/stripe/payments.mjs';

describe('Stripe Payments - flattenParams', () => {
  it('flattens simple params', () => {
    const result = flattenParams({ email: 'a@b.com', name: 'Test' });
    assert.deepEqual(result, { email: 'a@b.com', name: 'Test' });
  });

  it('flattens nested params (Stripe form encoding)', () => {
    const result = flattenParams({
      metadata: { order_id: '123', source: 'web' },
    });
    assert.deepEqual(result, {
      'metadata[order_id]': '123',
      'metadata[source]': 'web',
    });
  });

  it('flattens deeply nested params', () => {
    const result = flattenParams({
      line_items: { '0': { price: 'price_abc', quantity: '1' } },
    });
    assert.deepEqual(result, {
      'line_items[0][price]': 'price_abc',
      'line_items[0][quantity]': '1',
    });
  });

  it('handles empty object', () => {
    assert.deepEqual(flattenParams({}), {});
  });
});

describe('Stripe Payments - API functions (dry run, no live key)', () => {
  it('createCheckoutSession throws without STRIPE_SECRET_KEY', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { createCheckoutSession } = await import('../src/stripe/payments.mjs');
    await assert.rejects(
      () => createCheckoutSession({ priceId: 'price_test', successUrl: 'http://ok', cancelUrl: 'http://cancel' }),
      { message: /STRIPE_SECRET_KEY/ },
    );
  });
});
