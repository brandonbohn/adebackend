
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import contentRoutes from './routes/contentRoutes';
import { getAdedata } from './controllers/contentController';
import donorRoutes from './routes/donorroutes';
import donationRoutes from './routes/donationroutes';
import volunteerRoutes from './routes/volunteerRoutes';
import contactRoutes from './routes/contactRoutes';
import adminRoutes from './routes/adminRoutes';
import paymentRoutes from './routes/paymentRoutes';
import budgetRoutes from './routes/budgetRoutes';
import programRoutes from './routes/programRoutes';
import expenseRoutes from './routes/expenseRoutes';
import reportRoutes from './routes/reportRoutes';
import donorSystemContentRoutes from './routes/donorSystemContentRoutes';
import sponsoredGirlRoutes from './routes/sponsoredGirlRoutes';
import sponsorshipRoutes from './routes/sponsorshipRoutes';

console.log('=== SERVER STARTUP LOG ===');
dotenv.config();
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '8080');
console.log('Current directory:', __dirname);
console.log('=========================');

const app = express();
console.log('Express app created');
app.use(express.json());
console.log('JSON middleware loaded');

// Enable CORS for only the production frontend domain

// Simple test endpoint (compatible with any platform)
app.get('/_railway_test', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the ADEF-C Backend Server' });
});
app.use(cors({
  origin: [
    'https://www.adekiberafoundation.org',
    'http://localhost:5173', // allow local dev
    'http://localhost:5175', // allow local dev (alt port)
    'http://localhost:5174'  // allow local dev (alt port)
  ],
  credentials: true
}));
console.log('CORS middleware loaded');

/* The code snippet `app.get("/_railway_test", (req: Request, res: Response) => {
  res.send("Welcome to the ADEF-C Backend Server");
});` is setting up a route in the Express application. */


app.get("/health", (req: Request, res: Response) => {
  const healthInfo = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    port: PORT || process.env.PORT,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage()
  };
  console.log('Health check requested:', healthInfo);
  res.json(healthInfo);
});
console.log('Loading content routes...');
// Explicit adedata route to avoid any routing ambiguity
app.get('/api/content/adedata', (req: Request, res: Response) => {
  // Delegate to controller which uses Mongo-first, JSON fallback
  // No return type is required; controller handles response fully
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  getAdedata(req, res);
});
app.use('/api/content', contentRoutes);
console.log('Content routes loaded');

console.log('Loading donor routes...');
app.use('/api/donors', donorRoutes);
console.log('Donor routes loaded');

console.log('Loading donation routes...');
app.use('/api/donations', donationRoutes);
console.log('Donation routes loaded');

console.log('Loading payment routes...');
app.use('/api/payments', paymentRoutes);
console.log('Payment routes loaded');

console.log('Loading volunteer routes...');
app.use('/api/volunteers', volunteerRoutes);
app.use('/volunteers', volunteerRoutes); // Redirect /volunteers to /api/volunteers for frontend compatibility

// Quick GET endpoint for /volunteers page load
app.get('/volunteers', (req: Request, res: Response) => {
  const fs = require('fs');
  const path = require('path');
  const volunteersFilePath = path.join(__dirname, 'json', 'volunteers.json');
  try {
    if (fs.existsSync(volunteersFilePath)) {
      const data = fs.readFileSync(volunteersFilePath, 'utf-8');
      res.json(JSON.parse(data || '[]'));
    } else {
      res.json([]);
    }
  } catch (error) {
    res.json([]);
  }
});

console.log('Volunteer routes loaded');

console.log('Loading contact routes...');
app.use('/api/contacts', contactRoutes);
// Add aliases for contact routes
app.use('/api/contact', contactRoutes);
app.use('/contact', contactRoutes);
app.use('/contacts', contactRoutes);
console.log('Contact routes loaded');

console.log('Loading admin routes...');
app.use('/api/admin', adminRoutes);
console.log('Admin routes loaded');

console.log('Loading budget routes...');
app.use('/api/budgets', budgetRoutes);
console.log('Budget routes loaded');

console.log('Loading program routes...');
app.use('/api/programs', programRoutes);
console.log('Program routes loaded');

console.log('Loading expense routes...');
app.use('/api/expenses', expenseRoutes);
console.log('Expense routes loaded');

console.log('Loading report routes...');
app.use('/api/reports', reportRoutes);
console.log('Report routes loaded');

console.log('Loading donor system content routes...');
app.use('/api/donor-system-content', donorSystemContentRoutes);
console.log('Donor system content routes loaded');

console.log('Loading sponsored girls routes...');
app.use('/api/sponsored-girls', sponsoredGirlRoutes);
console.log('Sponsored girls routes loaded');

console.log('Loading sponsorship routes...');
app.use('/api/sponsorships', sponsorshipRoutes);
console.log('Sponsorship routes loaded');

const PORT = parseInt(process.env.PORT || '8080', 10);
console.log(`Attempting to bind to port ${PORT} on 0.0.0.0...`);

const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB || 'adebackend';
if (!mongoUri) {
  console.error('MONGO_URI is not set. Server will not start.');
  process.exit(1);
}

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 8000, dbName: mongoDbName })
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server successfully started on port ${PORT}`);
      console.log(`✓ Server accessible at http://0.0.0.0:${PORT}`);
      console.log('=== SERVER READY ===');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
// DB health endpoint (local verification and ops)
app.get('/api/db/health', async (_req: Request, res: Response) => {
  try {
    const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    let ping: any = null;
    if (mongoose.connection.db) {
      ping = await mongoose.connection.db.admin().ping();
    }
    res.json({
      ok: true,
      readyState: state,
      ping,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'unknown' });
  }
});


// Health check and static file check endpoints
app.get('/api/check-json', (req: Request, res: Response) => {
  const dataPath = path.join(__dirname, 'json', 'adedata.json');
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      res.json({ exists: true, length: raw.length, preview: raw.slice(0, 200) });
    } else {
      res.status(404).json({ exists: false, message: 'adedata.json not found', path: dataPath });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error reading adedata.json', details: err });
  }
});

// Reports current content source for adedata and donateSection
app.get('/api/content-source', async (_req: Request, res: Response) => {
  try {
    let adedataSource: 'mongo' | 'json-fallback' | 'not-found' = 'not-found';
    let donateSectionSource: 'mongo' | 'json-fallback' | 'not-found' = 'not-found';

    // Check MongoDB site collection first
    try {
      const coll = mongoose.connection.collection('site');
      const doc = await coll.findOne({}, { sort: { insertedAt: -1 } });
      if (doc?.data) {
        const siteData = Array.isArray(doc.data) && doc.data.length > 0 ? doc.data[0] : doc.data;
        if (siteData) {
          adedataSource = 'mongo';
        }
        if (siteData?.sectionsData?.donateSection) {
          donateSectionSource = 'mongo';
        }
      }
    } catch (mongoErr: any) {
      console.error('Content-source Mongo lookup failed:', mongoErr?.message);
    }

    // Fallback checks from JSON file if Mongo did not provide data
    if (adedataSource !== 'mongo' || donateSectionSource !== 'mongo') {
      const dataPath = path.join(__dirname, '../json/adedata.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw || '[]');
        const siteData = Array.isArray(data) ? data[0] : data;

        if (adedataSource !== 'mongo' && siteData) {
          adedataSource = 'json-fallback';
        }
        if (donateSectionSource !== 'mongo' && siteData?.sectionsData?.donateSection) {
          donateSectionSource = 'json-fallback';
        }
      }
    }

    res.json({
      adedataSource,
      donateSectionSource,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to determine content source', details: err?.message || err });
  }
});


// Dedicated endpoint for donateSection
app.get(['/api/donate', '/donate', '/api/content/donate'], async (_req: Request, res: Response) => {
  try {
    let donateSection: any = null;

    // Try MongoDB site collection first
    try {
      const coll = mongoose.connection.collection('site');
      const doc = await coll.findOne({}, { sort: { insertedAt: -1 } });
      if (doc?.data) {
        const siteData = Array.isArray(doc.data) && doc.data.length > 0 ? doc.data[0] : doc.data;
        donateSection = siteData?.sectionsData?.donateSection;
      }
    } catch (mongoErr: any) {
      console.error('Donate endpoint Mongo lookup failed:', mongoErr?.message);
    }

    // Fallback to JSON file (project-root json directory)
    if (!donateSection) {
      const dataPath = path.join(__dirname, '../json/adedata.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw || '[]');
        const siteData = Array.isArray(data) ? data[0] : data;
        donateSection = siteData?.sectionsData?.donateSection;
      }
    }

    if (!donateSection) {
      return res.status(404).json({ error: 'donateSection not found' });
    }

    res.json(donateSection);
  } catch (err) {
    res.status(500).json({ error: 'Error reading donateSection', details: err });
  }
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});
