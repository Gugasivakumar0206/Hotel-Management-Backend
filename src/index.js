import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import {
  authRoutes,
  hotelRoutes,
  roomTypeRoutes,
  bookingRoutes,
  reviewRoutes,
  offerRoutes,
  adminRoutes,
  paymentRoutes
} from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 8080;

const allowed = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowed.length === 0 || allowed.includes(origin)),
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_hotel_booking')
  .then(() => app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });
