import express from 'express';
import RoomType from '../models/RoomType.js';
import Availability from '../models/Availability.js';

const router = express.Router();

router.get('/:id', async (req,res) => {
  const rt = await RoomType.findById(req.params.id).populate('hotel');
  if (!rt) return res.status(404).json({ message: 'Not found' });
  res.json(rt);
});

router.get('/:id/availability', async (req,res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) return res.status(400).json({ message: 'checkIn and checkOut required' });
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (!(start < end)) return res.status(400).json({ message: 'Invalid date range' });

  const dates = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate()+1)) {
    dates.push(new Date(d));
  }
  const docs = await Availability.find({ roomType: req.params.id, date: { $gte: start, $lt: end } }).lean();
  const byDate = new Map(docs.map(doc => [new Date(doc.date).toISOString().slice(0,10), doc]));
  const result = dates.map(d => {
    const key = d.toISOString().slice(0,10);
    const doc = byDate.get(key);
    if (!doc) return { date: key, remaining: 0, total: 0 };
    return { date: key, remaining: Math.max(0, (doc.total||0) - (doc.reserved||0)), total: doc.total||0 };
  });
  res.json(result);
});

export default router;
