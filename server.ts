




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
app.use(cors());
// Serve static JSON files
app.use('/Backend/json', express.static(path.join(__dirname, 'json')));
const port = process.env.PORT || 3002;


app.use(express.json());
// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adefc';
mongoose.connect(mongoUri)
	.then(() => console.log('MongoDB connected'))
	.catch((err: any) => console.error('MongoDB connection error:', err));

// Root route
interface RootRequest extends Request {}
interface RootResponse extends Response {}

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
app.use('/content', contentRoutes);

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
