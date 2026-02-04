
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

interface RailwayTestRequest extends Request {}
interface RailwayTestResponse extends Response {}

app.get(
	"/_railway_test",
	(_: RailwayTestRequest, req: RailwayTestRequest, res: RailwayTestResponse) => {
		res.send("Welcome to the ADEF-C Backend Server");
	}
);
app.use(cors({
  origin: [
    'https://www.adekiberafoundation.org',
    'http://localhost:5173' // allow local dev
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

const PORT = parseInt(process.env.PORT || '8080', 10);
console.log(`Attempting to bind to port ${PORT} on 0.0.0.0...`);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI is not set. Server will not start.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
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


// Dedicated endpoint for donateSection
app.get('/api/donate', (req: Request, res: Response) => {
  const dataPath = path.join(__dirname, 'json', 'adedata.json');
  try {
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'adedata.json not found' });
    }
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    const donateSection = data[0]?.sectionsData?.donateSection;
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
