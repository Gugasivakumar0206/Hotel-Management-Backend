import express from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import RoomType from '../models/RoomType.js';
import Availability from '../models/Availability.js';
import Offer from '../models/Offer.js';
import { nightsBetween, applyDiscount } from '../utils/calc.js';

const router = express.Router();

router.get('/my', requireAuth, async (req,res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('hotel roomType');
  res.json(bookings);
});

router.get('/:id', requireAuth, async (req,res) => {
  const b = await Booking.findOne({ _id: req.params.id, user: req.user.id }).populate('hotel roomType');
  if (!b) return res.status(404).json({ message: 'Not found' });
  res.json(b);
});

router.post('/', requireAuth, async (req,res) => {
  const { hotelId, roomTypeId, checkIn, checkOut, guests, specialRequests, discountCode } = req.body;
  const roomType = await RoomType.findById(roomTypeId).populate('hotel');
  if (!roomType) return res.status(404).json({ message: 'Room type not found' });

  // pricing
  const nights = nightsBetween(checkIn, checkOut);
  if (!nights) return res.status(400).json({ message: 'Invalid dates' });
  const nightlyRate = roomType.basePrice;
  let subtotal = nightlyRate * nights;
  let discountAmount = 0;

  let offer = null;
  if (discountCode) {
    offer = await Offer.findOne({ code: discountCode.toUpperCase(), active: true });
    if (!offer) return res.status(400).json({ message: 'Invalid discount code' });
    if (offer.minNights && nights < offer.minNights) return res.status(400).json({ message: `Minimum ${offer.minNights} nights` });
    const disc = applyDiscount(subtotal, offer);
    subtotal = disc.discounted;
    discountAmount = disc.discountAmount;
  }

  const taxesAndFees = Math.round(subtotal * 0.12); // simple 12% for demo
  const total = subtotal + taxesAndFees;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // lock inventory for each date
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    for (let d = new Date(start); d < end; d.setDate(d.getDate()+1)) {
      const day = new Date(d);
      const updated = await Availability.findOneAndUpdate(
        { roomType: roomTypeId, date: day, reserved: { $lt: '$total' } }, // '$total' is not allowed; do two-step
        {}, { session }
      );
      // work-around: check then inc
      const doc = await Availability.findOne({ roomType: roomTypeId, date: day }).session(session);
      if (!doc || doc.reserved >= doc.total) throw new Error('NoInventory');
      doc.reserved += 1;
      await doc.save({ session });
    }

    const booking = await Booking.create([{
      user: req.user.id,
      hotel: roomType.hotel._id,
      roomType: roomType._id,
      checkIn, checkOut, guests,
      nightlyRate, subtotal, discountCode, discountAmount,
      taxesAndFees, total, currency: 'INR',
      status: (process.env.PAYMENT_MODE === 'mock') ? 'confirmed' : 'pending',
      payment: { provider: process.env.PAYMENT_MODE === 'mock' ? 'mock' : 'stripe', status: (process.env.PAYMENT_MODE === 'mock') ? 'paid' : 'requires_payment' },
      specialRequests
    }], { session });

    await session.commitTransaction();
    res.json({ booking: booking[0], clientSecret: process.env.PAYMENT_MODE === 'mock' ? 'mock_client_secret' : null });
  } catch (e) {
    await session.abortTransaction();
    if (e.message === 'NoInventory') return res.status(409).json({ message: 'No availability for selected dates' });
    throw e;
  } finally {
    session.endSession();
  }
});

router.post('/:id/cancel', requireAuth, async (req,res) => {
  const b = await Booking.findOne({ _id: req.params.id, user: req.user.id });
  if (!b) return res.status(404).json({ message: 'Not found' });
  if (b.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
  b.status = 'cancelled';
  await b.save();
  // Release inventory
  const start = new Date(b.checkIn);
  const end = new Date(b.checkOut);
  for (let d = new Date(start); d < end; d.setDate(d.getDate()+1)) {
    await Availability.updateOne({ roomType: b.roomType, date: new Date(d) }, { $inc: { reserved: -1 } });
  }
  res.json({ ok: true });
});

// Admin views
router.get('/', requireAuth, requireAdmin, async (req,res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const list = await Booking.find(filter).populate('hotel roomType user');
  res.json(list);
});

export default router;
