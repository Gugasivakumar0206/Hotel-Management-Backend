// server/src/seed/set-images.js
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Hotel from '../models/Hotel.js';
import RoomType from '../models/RoomType.js';

await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_hotel_booking');

const seaside = [
  '/images/hotels/hotel1.jpg',
  '/images/hotels/hotel2.jpg',
  '/images/hotels/card1.jpg',
  '/images/hotels/card2.jpg',
  '/images/hotels/card3.jpg',
  '/images/hotels/card4.jpg',
  '/images/hotels/card5.jpg',
  '/images/hotels/card6.jpg',
  '/images/hotels/card7.jpg',
];

const mountain = [
  '/images/hotels/hotel3.jpg',
  '/images/hotels/hotel4.jpg',
  '/images/hotels/card8.jpg',
  '/images/hotels/card9.jpg',
  '/images/hotels/card10.jpg',
  '/images/hotels/card11.jpg',
  '/images/hotels/card12.jpg',
  '/images/hotels/card13.jpg',
  '/images/hotels/card14.jpg',
  '/images/hotels/card15.jpg',
];

// Update hotels
await Hotel.updateOne({ slug: 'seaside-retreat' }, { $set: { images: seaside } });
await Hotel.updateOne({ slug: 'mountain-view-inn' }, { $set: { images: mountain } });

// Make each hotel's room types use its first image (nice thumbnails)
const s = await Hotel.findOne({ slug: 'seaside-retreat' }, { _id: 1 });
if (s) await RoomType.updateMany({ hotel: s._id }, { $set: { images: [seaside[0]] } });

const m = await Hotel.findOne({ slug: 'mountain-view-inn' }, { _id: 1 });
if (m) await RoomType.updateMany({ hotel: m._id }, { $set: { images: [mountain[0]] } });

console.log('✅ Updated hotel & room images');
process.exit(0);
