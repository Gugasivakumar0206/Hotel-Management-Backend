// server/src/index.js
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
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1);

// CORS
const allowed = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => res.type('text').send('Hotel API is running. Try /api/health'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not Found' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_hotel_booking')
  .then(() => app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('DB connect failed:', err); process.exit(1); });
