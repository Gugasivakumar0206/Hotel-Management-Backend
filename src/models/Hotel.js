import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true, index: true },
  location: { city: String, country: String },
  description: String,
  images: [String],
  amenities: [String],
  ratingAvg: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Hotel', HotelSchema);
