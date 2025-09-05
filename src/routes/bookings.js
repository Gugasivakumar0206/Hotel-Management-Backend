// server/src/routes/bookings.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Quick create (expects hotelId, roomTypeId, checkIn, checkOut, guests)
router.post('/', requireAuth, async (req, res) => {
  const { hotelId, roomTypeId, checkIn, checkOut, guests = 1 } = req.body || {};
  if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
    return res.status(400).json({ message: 'Missing booking fields' });
  }
  const doc = await Booking.create({
    user: req.user.id,
    hotel: hotelId,
    roomType: roomTypeId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    guests,
    status: 'confirmed',
    paymentStatus: 'unpaid',
  });
  res.json({ ok: true, booking: doc });
});

router.get('/me', requireAuth, async (req, res) => {
  const list = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
});

export default router;
