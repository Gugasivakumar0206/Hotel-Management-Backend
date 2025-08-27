import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', index: true },
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  nightlyRate: Number,
  subtotal: Number,
  discountCode: String,
  discountAmount: Number,
  taxesAndFees: Number,
  total: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum:['pending','confirmed','cancelled','refunded'], default:'pending' },
  payment: {
    provider: String,
    intentId: String,
    chargeId: String,
    status: { type: String, enum:['requires_payment','paid','failed','refunded'], default: 'requires_payment' }
  },
  specialRequests: String
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
