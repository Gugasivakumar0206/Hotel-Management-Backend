// server/src/routes/hotels.js
import express from 'express';
import Hotel from '../models/Hotel.js';
import RoomType from '../models/RoomType.js';

const router = express.Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/hotels?city=Manali&q=pool
router.get('/', async (req, res) => {
  const { city, q } = req.query;
  const filter = {};

  if (city && city.trim()) {
    const parts = city.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 1) {
      filter['location.city'] = new RegExp(`^${esc(parts[0])}$`, 'i'); // exact, case-insensitive
    } else {
      filter['location.city'] = { $in: parts.map(c => new RegExp(`^${esc(c)}$`, 'i')) };
    }
  }

  if (q && q.trim()) {
    const term = q.trim();
    try {
      const hotels = await Hotel.find({ ...filter, $text: { $search: term } }).limit(50);
      if (hotels.length) {
        console.log('[hotels GET] filter(text):', filter, 'count=', hotels.length);
        return res.json(hotels);
      }
    } catch (_) {}
    filter.$or = [
      { name: new RegExp(esc(term), 'i') },
      { description: new RegExp(esc(term), 'i') },
    ];
  }

  const hotels = await Hotel.find(filter).limit(50);
  console.log('[hotels GET] filter:', filter, 'count=', hotels.length);
  res.json(hotels);
});

// GET /api/hotels/:slug
router.get('/:slug', async (req, res) => {
  const hotel = await Hotel.findOne({ slug: req.params.slug });
  if (!hotel) return res.status(404).json({ message: 'Not found' });
  const roomTypes = await RoomType.find({ hotel: hotel._id });
  res.json({ hotel, roomTypes });
});

export default router;
