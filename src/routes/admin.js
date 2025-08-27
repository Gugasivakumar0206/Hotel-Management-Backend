import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Hotel from '../models/Hotel.js';
import RoomType from '../models/RoomType.js';
import Availability from '../models/Availability.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

// Hotels CRUD
router.post('/hotels', async (req,res) => {
  const created = await Hotel.create(req.body);
  res.json(created);
});
router.put('/hotels/:id', async (req,res) => {
  const updated = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});
router.delete('/hotels/:id', async (req,res) => {
  await Hotel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// RoomTypes CRUD
router.post('/room-types', async (req,res) => {
  const created = await RoomType.create(req.body);
  res.json(created);
});
router.put('/room-types/:id', async (req,res) => {
  const updated = await RoomType.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});
router.delete('/room-types/:id', async (req,res) => {
  await RoomType.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Availability upsert
router.post('/availability/upsert', async (req,res) => {
  const { roomType, date, total } = req.body;
  const d = new Date(date);
  const updated = await Availability.findOneAndUpdate(
    { roomType, date: d },
    { $setOnInsert: { reserved: 0 }, $set: { total } },
    { upsert: true, new: true }
  );
  res.json(updated);
});

export default router;
