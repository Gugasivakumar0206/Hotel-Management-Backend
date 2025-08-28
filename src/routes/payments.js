import express from 'express';
const router = express.Router();

/**
 * Payments route that works with or without Stripe installed.
 * - If STRIPE_SECRET is set and the 'stripe' package exists, endpoints are enabled.
 * - Otherwise they return 501 so the API still boots on Render.
 */

let stripe = null;
if (process.env.STRIPE_SECRET) {
  try {
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(process.env.STRIPE_SECRET);
    console.log('✅ Stripe initialized');
  } catch (e) {
    console.warn('⚠️ Stripe not installed or failed to init; payments disabled.', e.message);
  }
}

router.get('/health', (req, res) => {
  res.json({ paymentsEnabled: Boolean(stripe) });
});

router.post('/create-intent', async (req, res) => {
  if (!stripe) return res.status(501).json({ message: 'Payments not configured' });

  const { amount, currency = 'inr', metadata = {} } = req.body || {};
  if (!amount || Number.isNaN(+amount)) {
    return res.status(400).json({ message: 'amount (in smallest unit) is required' });
  }
  try {
    const pi = await stripe.paymentIntents.create({
      amount: Math.trunc(+amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    res.json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ message: 'Stripe error', error: err.message });
  }
});

export default router;
