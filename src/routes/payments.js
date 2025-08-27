import express from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create a payment intent (Stripe) - optional, mock by default
router.post('/stripe/intent', async (req,res) => {
  if (process.env.PAYMENT_MODE === 'mock' || !process.env.STRIPE_SECRET_KEY) {
    return res.json({ clientSecret: 'mock_client_secret', mode: 'mock' });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const intent = await stripe.paymentIntents.create({
    amount: booking.total * 100,
    currency: 'inr',
    automatic_payment_methods: { enabled: true },
    metadata: { bookingId: booking._id.toString() }
  });
  res.json({ clientSecret: intent.client_secret });
});

export default router;
