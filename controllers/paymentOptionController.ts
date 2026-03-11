
import { processPaypalPayment, processMpesaPayment, processFlutterwavePayment } from '../services/paymentOptionService';
import { Request, Response } from 'express';
import { PaymentProcessingRequest, PaymentProcessingResponse } from '../types/paymentTypes';
import { PaymentOptionModel } from '../models/PaymentOption';

function normalizePaymentProvider(value: unknown): 'paypal' | 'mpesa' | 'flutterwave' | '' {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, '');

  if (normalized === 'paypal') return 'paypal';
  if (normalized === 'mpesa') return 'mpesa';
  if (normalized === 'flutterwave') return 'flutterwave';
  return '';
}


export async function processPayment(
  req: Request<{}, {}, PaymentProcessingRequest>,
  res: Response<PaymentProcessingResponse>
) {
  const { amount, currency, paymentOptionType, paymentDetails } = req.body;
  const provider = normalizePaymentProvider(paymentOptionType);

  try {
    // Validate required fields
    if (!amount || !currency || !provider) {
      return res.status(400).json({
        status: 'error',
        provider: provider || String(paymentOptionType || ''),
        message: 'Missing required fields: amount, currency, paymentOptionType'
      });
    }

    // Validate amount
    const numAmount = parseFloat(String(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        provider,
        message: 'Invalid amount. Please enter a positive number.'
      });
    }

    // Validate amount is not too large (prevent errors)
    if (numAmount > 999999) {
      return res.status(400).json({
        status: 'error',
        provider,
        message: 'Amount exceeds maximum limit. Please contact support for large donations.'
      });
    }

    // Validate currency format
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({
        status: 'error',
        provider,
        message: 'Invalid currency code'
      });
    }

    // Validate payment details
    if (!paymentDetails || !paymentDetails.email) {
      return res.status(400).json({
        status: 'error',
        provider,
        message: 'Donor email is required'
      });
    }

    if (provider === 'paypal') {
      const result = await processPaypalPayment(req.body);
      return res.json(result);
    } else if (provider === 'mpesa') {
      const result = await processMpesaPayment(req.body);
      return res.json(result);
    } else if (provider === 'flutterwave') {
      const result = await processFlutterwavePayment(req.body);
      return res.json(result);
    } else {
      return res.status(400).json({
        status: 'error',
        provider,
        message: 'Unsupported payment provider'
      });
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      status: 'error',
      provider: provider || String(paymentOptionType || ''),
      message: error.message || 'Payment processing failed'
    });
  }
}

interface UpdatePaymentOptionParams {
  id: string;
}

interface UpdatePaymentOptionBody {
  type: string;
  details: string;
}


export async function createPaymentOption(req: Request, res: Response): Promise<void> {
  try {
    const { type, label, description } = req.body;
    const option = await PaymentOptionModel.create({ type, label, description });
    res.status(201).json(option);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment option' });
  }
}

export async function updatePaymentOption(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const { type, label, description } = req.body;
    const result = await PaymentOptionModel.findByIdAndUpdate(id, { type, label, description }, { new: true });
    if (result) {
      res.json({ message: 'Payment option updated successfully', option: result });
    } else {
      res.status(404).json({ error: 'Payment option not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment option' });
  }
}

export async function getPaymentOptions(req: Request, res: Response): Promise<void> {
  try {
    const options = await PaymentOptionModel.find();
    res.status(200).json(options);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment options' });
  }
}

export async function deletePaymentOption(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    await PaymentOptionModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment option' });
  }
}

export function getAllAvailablePaymentOptions(req: Request, res: Response): void {
  const options = [
    { id: 1, type: 'paypal', label: 'PayPal' },
    { id: 2, type: 'mpesa', label: 'M-Pesa' },
    { id: 3, type: 'flutterwave', label: 'Flutterwave' }
    // Add more as needed
  ];
  res.json(options);


}
