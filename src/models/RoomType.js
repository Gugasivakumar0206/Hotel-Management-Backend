import mongoose from 'mongoose';

const RoomTypeSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },
  name: String,
  description: String,
  images: [String],
  basePrice: Number,
  sizeSqm: Number,
  bedType: String,
  view: String,
  maxGuests: Number,
  amenities: [String],
  totalUnits: Number
}, { timestamps: true });

export default mongoose.model('RoomType', RoomTypeSchema);
