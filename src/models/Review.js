import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' },
  rating: { type: Number, min: 1, max: 5 },
  title: String,
  body: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Review', ReviewSchema);
