import express from 'express';
import { processPayment } from '../controllers/paymentOptionController';

const router = express.Router();

// Unified payment endpoint for all providers
router.post('/process-payment', processPayment);

export default router;
