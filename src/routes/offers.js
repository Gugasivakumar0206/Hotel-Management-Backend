import express from 'express';
import Offer from '../models/Offer.js';

const router = express.Router();

router.get('/active', async (req,res) => {
  const now = new Date();
  const offers = await Offer.find({
    active: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now }
  }).lean();
  res.json(offers);
});

router.post('/apply', async (req,res) => {
  const { code, nights } = req.body;
  const offer = await Offer.findOne({ code: code.toUpperCase(), active: true });
  if (!offer) return res.status(404).json({ message: 'Invalid code' });
  const now = new Date();
  if (offer.startsAt && offer.startsAt > now) return res.status(400).json({ message: 'Offer not started' });
  if (offer.endsAt && offer.endsAt < now) return res.status(400).json({ message: 'Offer expired' });
  if (offer.minNights && nights < offer.minNights) return res.status(400).json({ message: `Minimum ${offer.minNights} nights` });
  res.json(offer);
});

export default router;
