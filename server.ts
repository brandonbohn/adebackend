import fs from 'fs';
import { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import contentRoutes from './routes/contentRoutes';
import path from 'path';
import { addDonor, getDonors, getDonorById, deleteDonor } from './controllers/donorController';
import { createPaymentOption, updatePaymentOption, getPaymentOptions, deletePaymentOption } from './controllers/paymentOptionController';
import { createCart, getCart, addItemToCart, removeItemFromCart } from './controllers/cartController';
import { getAllAvailablePaymentOptions } from './controllers/paymentOptionController';
import { processPayment } from './controllers/paymentOptionController';

dotenv.config();
console.log('Starting server...');
const app = express();
app.use(cors({
  origin: 'https://www.adekiberafoundation.org',
  credentials: true
}));
// Serve static JSON files
app.use('/Backend/json', express.static(path.join(__dirname, 'json')));
const port = process.env.PORT || 3000;
app.use(express.json());

// Endpoint to check adedata.json presence and contents
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
dotenv.config();

app.get('/', (req: Request, res: Response) => {
res.send('API is running');
});


// Donor CRUD routes
console.log('Registering donor routes');
app.post('/donors', addDonor);
app.get('/donors', getDonors);
app.get('/donors/:id', getDonorById);
app.delete('/donors/:id', deleteDonor);

// Payment Option CRUD routes
app.post('/payment-options', createPaymentOption);
app.put('/payment-options/:id', updatePaymentOption);
app.get('/payment-options', getPaymentOptions);
app.delete('/payment-options/:id', deletePaymentOption);

// Cart CRUD routes
app.post('/carts', createCart);
app.get('/carts/:id', getCart);
app.post('/carts/:id/items', addItemToCart);
app.delete('/carts/:id/items/:itemIndex', removeItemFromCart);

// Payment Options Available Route
app.get('/available-payment-options', getAllAvailablePaymentOptions);
// Payment Processing Endpoint
app.post('/process-payment', processPayment);

// Website Content CRUD routes
app.use('/api/content', contentRoutes);
// Girls API route
// Removed girls API route as data is now served from content route


app.listen(port, () => {
	console.log(`Server running on port ${port}`);
	console.log('Startup complete');
});

process.on('uncaughtException', err => {
	console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
	console.error('Unhandled Rejection:', err);
});
