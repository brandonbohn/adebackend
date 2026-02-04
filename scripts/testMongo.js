// Simple local MongoDB connection test using the same .env
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI missing in environment');
  process.exit(1);
}

async function main() {
  const start = Date.now();
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const elapsed = Date.now() - start;
    const admin = mongoose.connection.db.admin();
    const ping = await admin.ping();
    console.log('Connected ✓');
    console.log('Host:', mongoose.connection.host);
    console.log('DB Name:', mongoose.connection.name);
    console.log('Ping:', ping);
    console.log('Time (ms):', elapsed);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    const elapsed = Date.now() - start;
    console.error('Connection failed ✗');
    console.error(e);
    console.error('Time (ms):', elapsed);
    process.exit(1);
  }
}

main();
