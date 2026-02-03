/*
 Seed MongoDB from JSON files in ./json
 Usage: npm run seed
*/
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const JSON_DIR = path.join(__dirname, '..', 'json');

function readJson(filename) {
  const filePath = path.join(JSON_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`- Skip: ${filename} not found`);
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    const data = JSON.parse(raw || '[]');
    if (Array.isArray(data) && data.length === 0) {
      console.log(`- ${filename} is empty; nothing to insert`);
    }
    return data;
  } catch (e) {
    console.error(`! Error parsing ${filename}:`, e.message);
    return null;
  }
}

async function seedCollection(collectionName, docs) {
  if (!docs || (Array.isArray(docs) && docs.length === 0)) return;
  const coll = mongoose.connection.collection(collectionName);
  try {
    if (Array.isArray(docs)) {
      if (docs.length === 0) return;
      const result = await coll.insertMany(docs, { ordered: false });
      console.log(`✓ Inserted ${result.insertedCount} into ${collectionName}`);
    } else {
      const result = await coll.insertOne(docs);
      console.log(`✓ Inserted 1 into ${collectionName} (_id=${result.insertedId})`);
    }
  } catch (e) {
    console.error(`! Failed to insert into ${collectionName}:`, e.message);
  }
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI or MONGODB_URI is not set in environment.');
    process.exit(1);
  }
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected');

  // Donors
  const donors = readJson('donors.json');
  await seedCollection('Donors', donors);

  // Donations
  const donations = readJson('donations.json');
  await seedCollection('Donation', donations);

  // Contacts
  const contacts = readJson('contacts.json');
  await seedCollection('contacts', contacts);

  // Volunteers
  const volunteers = readJson('volunteers.json');
  await seedCollection('volunteers', volunteers);

  // Site content (full snapshot)
  const adedata = readJson('adedata.json');
  if (adedata) {
    await seedCollection('site', { data: adedata, insertedAt: new Date() });
    // Also flatten sectionsData into Content keys for granular access
    try {
      const snapshot = Array.isArray(adedata) ? adedata[0] : adedata;
      if (snapshot && snapshot.sectionsData && typeof snapshot.sectionsData === 'object') {
        const entries = Object.entries(snapshot.sectionsData);
        for (const [key, value] of entries) {
          await seedCollection('Content', { key, data: value, updatedAt: new Date() });
        }
        console.log(`✓ Upserted ${entries.length} content sections from adedata.json`);
      } else {
        console.warn('- adedata.json has no sectionsData to flatten');
      }
    } catch (e) {
      console.error('! Failed to flatten adedata.json into Content:', e.message);
    }
  }

  // Donation form content into Content collection
  const donationForm = readJson('donationform.json');
  if (donationForm) {
    await seedCollection('Content', { key: 'donationForm', data: donationForm, updatedAt: new Date() });
  }

  await mongoose.disconnect();
  console.log('All done.');
}

main().catch((e) => {
  console.error('! Seed error:', e);
  process.exit(1);
});
