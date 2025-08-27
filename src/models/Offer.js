import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true },
  title: String,
  description: String,
  discountType: { type: String, enum: ['percent','flat'] },
  value: Number,
  startsAt: Date,
  endsAt: Date,
  minNights: Number,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Offer', OfferSchema);
