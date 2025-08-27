import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', index: true },
  date: { type: Date, index: true },
  total: Number,
  reserved: { type: Number, default: 0 }
}, { timestamps: true });

AvailabilitySchema.index({ roomType: 1, date: 1 }, { unique: true });

export default mongoose.model('Availability', AvailabilitySchema);
