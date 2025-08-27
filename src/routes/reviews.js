import express from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req,res) => {
  const { hotel } = req.query;
  const filter = { status: 'approved' };
  if (hotel) filter.hotel = hotel;
  const reviews = await Review.find(filter).populate('user', 'name').sort({ createdAt: -1 }).limit(100);
  res.json(reviews);
});

router.post('/', requireAuth, async (req,res) => {
  const { hotel, roomType, rating, title, body } = req.body;
  // ensure user had a confirmed booking whose checkout has passed
  const pastStay = await Booking.findOne({
    user: req.user.id, hotel, roomType, status: 'confirmed', checkOut: { $lt: new Date() }
  });
  if (!pastStay) return res.status(400).json({ message: 'You can review only after your stay' });
  const review = await Review.create({ user: req.user.id, hotel, roomType, rating, title, body });
  res.json(review);
});

router.patch('/:id/moderate', requireAuth, requireAdmin, async (req,res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  const updated = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(updated);
});

export default router;
