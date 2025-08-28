// src/index.js
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
  paymentRoutes,
} from './routes/index.js';

const app = express();

// CORS
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) =>
      cb(null, !origin || allowed.length === 0 || allowed.includes(origin)),
    credentials: true,
  })
);

// security & parsers
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// simple root + health
app.get('/', (_req, res) =>
  res.send('Hotel API is running. Try /api/health or /api/hotels')
);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// ---- start server ONCE, after DB is ready ----
const start = async () => {
  const PORT = process.env.PORT || 8080; // Render provides PORT
  try {
    await connectDB(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_hotel_booking'
    );
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
};
start();

export default app;
