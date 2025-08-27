import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  phone: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' }]
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
