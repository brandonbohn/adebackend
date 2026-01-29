import { Request, Response } from 'express';
import { PaymentProcessingRequest } from '../types/paymentTypes';

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

    if (!provider || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: provider, amount, currency'
      });
    }

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-success?transactionId={transactionId}&donorId=${donorId}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate?cancelled=true`;

    let checkoutUrl = '';

    switch (provider) {
      case 'paypal':
        checkoutUrl = generatePayPalCheckout(
          amount as string,
          currency as string,
          name as string,
          email as string,
          donorId as string,
          successUrl,
          cancelUrl
        );
        break;

      case 'flutterwave':
        checkoutUrl = generateFlutterwaveCheckout(
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
        checkoutUrl = generateMpesaCheckout(
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

    console.log(`💳 Generating ${provider} checkout for donor ${donorId}, amount: ${amount} ${currency}`);

    // Redirect directly to the payment provider (browser-friendly)
    return res.redirect(checkoutUrl);
  } catch (error) {
    console.error('Error generating checkout URL:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate checkout URL'
    });
  }
};

/**
 * Payment success callback handler
 * GET /api/payments/success
 */
export const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { transactionId, donorId, provider, reference } = req.query;

    console.log(`✅ Payment successful: ${provider} transaction ${transactionId} for donor ${donorId}`);

    // TODO: Update donation record with transaction ID and status
    // TODO: Send confirmation email
    // TODO: Trigger any other success workflows

    // Redirect to success page (org-specific URL from env)
    const successPage = process.env.DONATION_SUCCESS_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donation-success?transactionId=${transactionId}&provider=${provider}`;
    res.redirect(successPage);
  } catch (error) {
    console.error('Error handling payment success:', error);
    const errorPage = process.env.DONATION_ERROR_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate?error=payment_failed`;
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

    // Redirect to cancel page (org-specific URL from env)
    const cancelPage = process.env.DONATION_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate?cancelled=true&provider=${provider}`;
    res.redirect(cancelPage);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate`);
  }
};

/**
 * PayPal Checkout URL Generator
 */
function generatePayPalCheckout(
  amount: string,
  currency: string,
  name: string,
  email: string,
  donorId: string,
  successUrl: string,
  cancelUrl: string
): string {
  // TODO: Implement real PayPal SDK integration
  // For now, redirect to PayPal homepage for testing
  console.log(`💳 PayPal checkout: $${amount} ${currency} from ${email} (donor: ${donorId})`);
  return 'https://www.paypal.com';
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
function generateMpesaCheckout(
  amount: string,
  currency: string,
  phone: string,
  donorId: string,
  successUrl: string,
  cancelUrl: string
): string {
  // TODO: Implement real M-Pesa (Safaricom) STK Push integration
  // For now, redirect to M-Pesa homepage for testing
  console.log(`💳 M-Pesa checkout: ${currency} ${amount} to ${phone} (donor: ${donorId})`);
  return 'https://www.safaricom.co.ke/personal/m-pesa';
}

/**
 * Webhook: PayPal IPN Handler
 */
export const handlePayPalWebhook = async (req: Request, res: Response) => {
  try {
    console.log('📨 PayPal IPN received:', req.body);

    const { item_number: donorId, mc_gross: amount, txn_id: transactionId, payment_status } = req.body;

    // TODO: Verify IPN authenticity with PayPal
    // TODO: Update donation record in database

    if (payment_status === 'Completed') {
      console.log(`✅ PayPal payment verified for donor ${donorId}: ${transactionId}`);
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
    const { Body } = req.body;
    
    console.log('📨 M-Pesa callback received');

    const result = Body?.stkCallback?.CallbackMetadata?.Item;
    const amount = result?.find((item: any) => item.Name === 'Amount')?.Value;
    const transactionId = result?.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;

    // TODO: Update donation record in database
    // TODO: Send confirmation email

    if (transactionId) {
      console.log(`✅ M-Pesa payment verified: ${transactionId} for amount: ${amount}`);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Confirmation received' });
  } catch (error) {
    console.error('Error handling M-Pesa webhook:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
};
