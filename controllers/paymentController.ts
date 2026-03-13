import { Request, Response } from 'express';
import { PaymentProcessingRequest } from '../types/paymentTypes';
import { createPayPalOrder, capturePayPalOrder, verifyPayPalWebhook } from '../services/paypalService';
import { initiateStkPush, parseStkCallback } from '../services/mpesaService';
import DonationModel from '../models/donations';
import mongoose from 'mongoose';

function normalizePaymentProvider(value: unknown): 'paypal' | 'flutterwave' | 'mpesa' | '' {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, '');

  if (normalized === 'paypal') return 'paypal';
  if (normalized === 'flutterwave') return 'flutterwave';
  if (normalized === 'mpesa') return 'mpesa';

  return '';
}

/**
 * Redirect to payment processor with pre-filled donor information
 * GET /api/payments/checkout
 * 
 * Query params:
 * - provider: paypal, flutterwave, mpesa
 * - amount: donation amount
 * - currency: USD, KES, etc
 * - donorId: ID for tracking
 * - name: donor name
 * - email: donor email
 */
export const getCheckoutUrl = async (req: Request, res: Response) => {
  try {
    const { provider, amount, currency, donorId, name, email, phone } = req.query;
    const normalizedProvider = normalizePaymentProvider(provider);

    if (!normalizedProvider || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: provider, amount, currency'
      });
    }

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-success?donorId=${donorId}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate?cancelled=true`;

    const forwardedProto = req.get('x-forwarded-proto');
    const forwardedHost = req.get('x-forwarded-host');
    const requestBaseUrl = forwardedHost
      ? `${forwardedProto || 'https'}://${forwardedHost}`
      : `${req.protocol}://${req.get('host')}`;
    const apiBaseUrl = process.env.API_URL || process.env.API_BASE_URL || requestBaseUrl || 'https://adebackend.onrender.com';

    // For PayPal, use backend success endpoint to capture payment first
    const paypalSuccessUrl = `${apiBaseUrl}/api/payments/success?provider=paypal&donorId=${donorId}`;
    const paypalCancelUrl = `${apiBaseUrl}/api/payments/cancel?provider=paypal&donorId=${donorId}`;

    let checkoutUrl = '';

    switch (normalizedProvider) {
      case 'paypal':
        checkoutUrl = await generatePayPalCheckout(
          amount as string,
          currency as string,
          name as string,
          email as string,
          donorId as string,
          paypalSuccessUrl,
          paypalCancelUrl
        );
        break;

      case 'flutterwave':
        checkoutUrl = await generateFlutterwaveCheckout(
          amount as string,
          currency as string,
          name as string,
          email as string,
          donorId as string,
          phone as string,
          successUrl,
          cancelUrl
        );
        break;

      case 'mpesa':
        checkoutUrl = await generateMpesaCheckout(
          amount as string,
          currency as string,
          phone as string,
          donorId as string,
          successUrl,
          cancelUrl
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported payment provider'
        });
    }

    console.log(`💳 Generating ${normalizedProvider} checkout for donor ${donorId}, amount: ${amount} ${currency}`);

    // Redirect directly to the payment provider (browser-friendly)
    return res.redirect(checkoutUrl);
  } catch (error) {
    console.error('Error generating checkout URL:', error);
    const errorPage = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-error?error=checkout_failed`;
    res.redirect(errorPage);
  }
};


export const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { transactionId, donorId, provider, reference, token } = req.query;

    console.log(`✅ Payment successful: ${provider} transaction ${transactionId} for donor ${donorId}`);

    // For PayPal, capture the order using the token
    if (provider === 'paypal' && token) {
      try {
        const result = await capturePayPalOrder(token as string);
        
        if (result.success) {
          console.log(`✅ PayPal payment captured: ${result.transactionId}`);
          
          // TODO: Update donation record with transaction ID and status
          // TODO: Send confirmation email
          
          const successPage = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-success?transactionId=${result.transactionId}&amount=${result.amount}&currency=${result.currency}&provider=paypal`;
          return res.redirect(successPage);
        } else {
          throw new Error('Payment capture failed');
        }
      } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        const errorPage = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate?error=capture_failed`;
        return res.redirect(errorPage);
      }
    }

    // Redirect to success page (org-specific URL from env)
    const successPage = process.env.DONATION_SUCCESS_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-success?transactionId=${transactionId}&provider=${provider}`;
    res.redirect(successPage);
  } catch (error) {
    console.error('Error handling payment success:', error);
    const errorPage = process.env.DONATION_ERROR_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-error?error=payment_failed`;
    res.redirect(errorPage);
  }
};

/**
 * Payment cancellation handler
 * GET /api/payments/cancel
 */
export const handlePaymentCancel = async (req: Request, res: Response) => {
  try {
    const { donorId, provider } = req.query;

    console.log(`⚠️ Payment cancelled: ${provider} for donor ${donorId}`);

    // Redirect to error page with cancelled flag
    const cancelPage = process.env.DONATION_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-error?cancelled=true&provider=${provider}`;
    res.redirect(cancelPage);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
    const errorPage = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-error?error=cancelled`;
    res.redirect(errorPage);
  }
};

/**
 * PayPal Checkout URL Generator
 */
async function generatePayPalCheckout(
  amount: string,
  currency: string,
  name: string,
  email: string,
  donorId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  try {
    console.log(`💳 Creating PayPal order: ${currency} ${amount} from ${email} (donor: ${donorId})`);
    
    const { orderId, approvalUrl } = await createPayPalOrder(
      amount,
      currency,
      donorId,
      successUrl,
      cancelUrl
    );

    console.log(`✅ PayPal order created: ${orderId}`);
    return approvalUrl;
  } catch (error) {
    console.error('Failed to create PayPal order:', error);
    throw error;
  }
}

/**
 * Flutterwave Checkout URL Generator
 */
function generateFlutterwaveCheckout(
  amount: string,
  currency: string,
  name: string,
  email: string,
  donorId: string,
  phone: string,
  successUrl: string,
  cancelUrl: string
): string {
  // TODO: Implement real Flutterwave SDK integration
  // For now, redirect to Flutterwave homepage for testing
  console.log(`💳 Flutterwave checkout: ${currency} ${amount} from ${email} (donor: ${donorId})`);
  return 'https://www.flutterwave.com';
}

/**
 * M-Pesa Checkout URL Generator
 */
async function generateMpesaCheckout(
  amount: string,
  currency: string,
  phone: string,
  donorId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  if (!phone) {
    throw new Error('Phone number is required for M-Pesa');
  }

  const parsedAmount = Number(amount);
  if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Amount must be a positive integer for M-Pesa');
  }

  console.log(`💳 Initiating M-Pesa STK push: ${currency} ${amount} to ${phone} (donor: ${donorId})`);

  const result = await initiateStkPush({
    amount: parsedAmount,
    phoneNumber: phone,
    accountReference: donorId || 'ADE-DONATION',
    transactionDesc: 'Donation to ADE Foundation'
  });

  if (!result.success) {
    throw new Error(result.message || 'M-Pesa STK push initiation failed');
  }

  const donationPayload: Record<string, any> = {
    amount: parsedAmount,
    date: new Date(),
    donationType: 'general',
    message: 'M-Pesa donation initiated',
    currency: currency || 'KES',
    paymentProvider: 'mpesa',
    paymentStatus: 'PENDING',
    checkoutRequestId: result.checkoutRequestId,
    merchantRequestId: result.merchantRequestId,
    paymentResultDesc: result.responseDescription
  };

  if (donorId && mongoose.Types.ObjectId.isValid(donorId)) {
    donationPayload.donorid = new mongoose.Types.ObjectId(donorId);
  }

  await DonationModel.create(donationPayload);

  const baseFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseFrontend}/donation-success?provider=mpesa&status=pending&checkoutRequestId=${result.checkoutRequestId || ''}`;
}






/**
 * Webhook: PayPal IPN Handler
 */
export const handlePayPalWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📨 PayPal webhook received:', req.body?.event_type);

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(req.headers, req.body);
    
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('⚠️ Invalid PayPal webhook signature');
      return res.status(401).send('Unauthorized');
    }

    const { event_type, resource } = req.body;

    // Handle different event types
    switch (event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        console.log(`✅ PayPal order approved: ${resource.id}`);
        // TODO: Store order approval
        break;

      case 'PAYMENT.CAPTURE.COMPLETED':
        const captureId = resource.id;
        const amount = resource.amount.value;
        const currency = resource.amount.currency_code;
        const orderId = resource.supplementary_data?.related_ids?.order_id;
        
        console.log(`✅ PayPal payment captured: ${captureId} for ${currency} ${amount}`);
        
        // TODO: Update donation record in database
        // TODO: Send confirmation email to donor
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        console.log(`❌ PayPal payment denied: ${resource.id}`);
        // TODO: Handle denied payment
        break;

      default:
        console.log(`📨 Unhandled PayPal event: ${event_type}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    res.status(500).send('Error');
  }
};

/**
 * Webhook: Flutterwave Payment Verification
 */
export const handleFlutterwaveWebhook = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    
    console.log('📨 Flutterwave webhook received for transaction:', data?.id);

    const { status, amount, currency, customer_email, tx_ref } = data || {};

    // TODO: Verify webhook signature with Flutterwave
    // TODO: Update donation record in database

    if (status === 'successful') {
      console.log(`✅ Flutterwave payment verified: ${tx_ref} for ${amount} ${currency}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Flutterwave webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Webhook: M-Pesa Payment Confirmation
 */
export const handleMpesaWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📨 M-Pesa callback received');

    const callback = parseStkCallback(req.body);
    const isSuccess = callback.resultCode === 0;
    const nextStatus = isSuccess ? 'SUCCESS' : 'FAILED';

    if (callback.checkoutRequestId) {
      await DonationModel.findOneAndUpdate(
        { checkoutRequestId: callback.checkoutRequestId, paymentProvider: 'mpesa' },
        {
          paymentStatus: nextStatus,
          paymentResultCode: callback.resultCode,
          paymentResultDesc: callback.resultDesc,
          mpesaReceiptNumber: callback.mpesaReceiptNumber,
          amount: callback.amount,
          date: new Date()
        },
        { new: true }
      );
    }

    if (isSuccess) {
      console.log(`✅ M-Pesa payment verified: ${callback.mpesaReceiptNumber} for amount: ${callback.amount}`);
    } else {
      console.log(`❌ M-Pesa payment failed: ${callback.checkoutRequestId} (${callback.resultCode}) ${callback.resultDesc}`);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Confirmation received' });
  } catch (error) {
    console.error('Error handling M-Pesa webhook:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
};
