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

// Render/Netlify will inject PORT; default for local dev:
const PORT = process.env.PORT || 8080;

// If you serve behind a proxy (Render), trust it so cookies & IP work correctly
app.set('trust proxy', 1);

// --- CORS Configuration ---
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / server-to-server / curl (no origin)
      if (!origin) return cb(null, true); // Allow no origin for server-to-server
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true); // Allow origin if listed in allowedOrigins
      }
      return cb(new Error(`CORS: ${origin} not allowed`), false); // Deny other origins
    },
    credentials: true, // Allow cookies to be sent cross-origin
  })
);

// --- Security & Common Middlewares ---
app.use(helmet()); // Adds various security headers
app.use(morgan('dev')); // Logs requests to the console
app.use(express.json()); // Parses JSON request bodies
app.use(cookieParser()); // Parses cookies from requests

// --- Simple root & health checks ---
app.get('/', (_req, res) =>
  res.type('text').send('Hotel API is running. Try /api/health or /api/hotels')
);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// --- 404 Fallback for Unknown API Routes ---
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not Found' }));

// --- Global Error Handler (Catches all errors not handled by the routes) ---
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err); // Log the error for debugging
  res.status(500).json({ message: 'Internal Server Error' }); // Return a 500 error response
});

// --- Bootstrapping the DB Connection and Server ---
connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_hotel_booking')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err); // Log database connection errors
    process.exit(1); // Exit process with error status
  });

// Optional: catch unhandled promise rejections (for more robust error handling)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason); // Log unhandled promise rejections
  process.exit(1); // Exit process with error status
});
