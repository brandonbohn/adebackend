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
  // PayPal checkout URL format
  // This uses the standard PayPal checkout flow
  // In production, use PayPal SDK to create orders server-side

  const params = new URLSearchParams({
    cmd: '_xclick',
    business: process.env.PAYPAL_EMAIL || 'adefoundation@example.com',
    item_name: 'ADE Donation - Support Girls in Kibera',
    item_number: donorId,
    amount,
    currency_code: currency,
    first_name: name.split(' ')[0],
    last_name: name.split(' ').slice(1).join(' '),
    payer_email: email,
    notify_url: `${process.env.API_URL || 'https://adebackend.onrender.com'}/api/payments/webhook/paypal`,
    return: successUrl,
    cancel_return: cancelUrl,
    no_shipping: '2',
    rm: '2'
  });

  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
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
  // Flutterwave embedded payment form
  // This generates the checkout page URL
  
  const amountInCents = Math.round(parseFloat(amount) * 100);
  
  const params = new URLSearchParams({
    public_key: process.env.FLUTTERWAVE_PUBLIC_KEY || 'test_key',
    tx_ref: `adef-${donorId}-${Date.now()}`,
    amount,
    currency,
    customer_email: email,
    customer_name: name,
    customer_phone: phone,
    title: 'ADE Organization Donation',
    description: 'Support education for girls in Kibera',
    redirect_url: successUrl,
    // meta data
    meta_donor_id: donorId
  });

  return `https://checkout.flutterwave.com/pay/${process.env.FLUTTERWAVE_PUBLIC_KEY || 'test_key'}?${params.toString()}`;
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
  // M-Pesa STK Push / Lipa Na M-Pesa Online
  // This would typically initiate an STK push prompt
  // For now, return a redirect to the STK push endpoint
  
  const params = new URLSearchParams({
    amount,
    phone_number: phone,
    donor_id: donorId,
    currency,
    callback_url: `${process.env.API_URL || 'https://adebackend.onrender.com'}/api/payments/webhook/mpesa`,
    return_url: successUrl
  });

  return `${process.env.API_URL || 'https://adebackend.onrender.com'}/api/payments/mpesa-stk-push?${params.toString()}`;
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
