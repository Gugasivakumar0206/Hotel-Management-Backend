import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Hotel from '../models/Hotel.js';
import RoomType from '../models/RoomType.js';
import Availability from '../models/Availability.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_hotel_booking';
await connectDB(MONGO_URI);

await Hotel.deleteMany({});
await RoomType.deleteMany({});
await Availability.deleteMany({});

// Basic sample data (images expected under client/public/images/hotels)
const hotels = await Hotel.insertMany([
  {
    name: 'Seaside Retreat',
    slug: 'seaside-retreat',
    location: { city: 'Goa', country: 'India' },
    description: 'Beachfront hotel with stunning views.',
    images: ['/images/hotels/1.jpg','/images/hotels/2.jpg'],
    amenities: ['Pool','WiFi','Breakfast','Parking']
  },
  {
    name: 'Mountain View Inn',
    slug: 'mountain-view-inn',
    location: { city: 'Manali', country: 'India' },
    description: 'Cozy rooms with mountain vistas.',
    images: ['/images/hotels/3.jpg','/images/hotels/4.jpg'],
    amenities: ['WiFi','Heater','Restaurant']
  }
]);

const seaside = hotels[0];
const mountain = hotels[1];

const rts = await RoomType.insertMany([
  { hotel: seaside._id, name: 'Deluxe King', description: 'Spacious king room.', images: ['/images/hotels/1.jpg'], basePrice: 4500, sizeSqm: 28, bedType: 'King', view: 'Sea', maxGuests: 2, amenities: ['AC','TV','Mini Bar'], totalUnits: 10 },
  { hotel: seaside._id, name: 'Family Suite', description: 'Two bedrooms suite.', images: ['/images/hotels/2.jpg'], basePrice: 6500, sizeSqm: 42, bedType: 'King+Twin', view: 'Garden', maxGuests: 4, amenities: ['AC','TV','Mini Bar','Sofa Bed'], totalUnits: 5 },
  { hotel: mountain._id, name: 'Standard Queen', description: 'Warm and comfortable.', images: ['/images/hotels/3.jpg'], basePrice: 3000, sizeSqm: 20, bedType: 'Queen', view: 'Mountain', maxGuests: 2, amenities: ['Heater','TV'], totalUnits: 12 }
]);

// Create availability for next 90 days
function* dateRange(days) {
  const start = new Date();
  start.setHours(0,0,0,0);
  for (let i=0; i<days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    yield d;
  }
}
const docs = [];
for (const rt of rts) {
  for (const d of dateRange(90)) {
    docs.push({ roomType: rt._id, date: d, total: rt.totalUnits, reserved: 0 });
  }
}
await Availability.insertMany(docs);

console.log('✅ Seeded hotels, room types, availability for 90 days');
await mongoose.disconnect();
process.exit(0);
