const paypal = require('@paypal/checkout-server-sdk');

/**
 * PayPal Service
 * Handles PayPal payment processing using the PayPal Checkout SDK
 */

// Configure PayPal environment
function getPayPalEnvironment() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();
  const mode = (process.env.PAYPAL_MODE || 'sandbox').trim().toLowerCase();

  console.log(`🔧 PayPal Environment: mode=${mode}, clientId=${clientId.substring(0, 10)}...`);

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured in environment variables');
  }

  // Use sandbox or production environment
  if (mode === 'live' || mode === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

// Create PayPal client
function getPayPalClient() {
  return new paypal.core.PayPalHttpClient(getPayPalEnvironment());
}

/**
 * Create a PayPal order for donation
 */
export async function createPayPalOrder(
  amount: string,
  currency: string,
  donorId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ orderId: string; approvalUrl: string }> {
  try {
    console.log(`📝 Creating PayPal order: amount=${amount}, currency=${currency}, donorId=${donorId}`);
    console.log(`🔗 Return URL: ${returnUrl}`);
    console.log(`❌ Cancel URL: ${cancelUrl}`);

    const client = getPayPalClient();
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'ADE Foundation',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      purchase_units: [
        {
          reference_id: donorId,
          description: 'Donation to ADE Foundation',
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    });

    console.log('🚀 Executing PayPal request...');
    const response = await client.execute(request);
    console.log('✅ PayPal request executed successfully');

    const order = response.result as any;

    // Find the approval URL
    const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL returned from PayPal');
    }

    console.log(`✅ PayPal order created: ${order.id} for ${currency} ${amount}`);

    return {
      orderId: order.id,
      approvalUrl,
    };
  } catch (error: any) {
    console.error('PayPal order creation failed:', {
      message: error?.message || String(error),
      details: error?.details || error,
      status: error?.statusCode,
      body: error?.body
    });
    throw new Error(`PayPal order creation failed: ${error?.message || error?.details?.[0]?.issue || String(error)}`);
  }
}

/**
 * Capture a PayPal order after user approval
 */
export async function capturePayPalOrder(orderId: string): Promise<{
  success: boolean;
  transactionId?: string;
  amount?: string;
  currency?: string;
  donorId?: string;
  status?: string;
}> {
  try {
    const client = getPayPalClient();
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);
    const order = response.result as any;

    if (order.status === 'COMPLETED') {
      const capture = order.purchase_units[0]?.payments?.captures?.[0];
      const donorId = order.purchase_units[0]?.reference_id;

      console.log(`✅ PayPal payment captured: ${capture?.id} for order ${orderId}`);

      return {
        success: true,
        transactionId: capture?.id,
        amount: capture?.amount?.value,
        currency: capture?.amount?.currency_code,
        donorId,
        status: order.status,
      };
    } else {
      console.warn(`⚠️ PayPal order ${orderId} not completed: ${order.status}`);
      return {
        success: false,
        status: order.status,
      };
    }
  } catch (error) {
    console.error('PayPal capture failed:', error);
    throw new Error('Failed to capture PayPal payment');
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(orderId: string): Promise<any> {
  try {
    const client = getPayPalClient();
    
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await client.execute(request);

    return response.result;
  } catch (error) {
    console.error('Failed to get PayPal order details:', error);
    throw new Error('Failed to retrieve PayPal order');
  }
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
  headers: any,
  body: any
): Promise<boolean> {
  try {
    const client = getPayPalClient();
    
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!webhookId) {
      console.warn('⚠️ PAYPAL_WEBHOOK_ID not configured, skipping verification');
      return false;
    }

    const request = new paypal.notifications.WebhookVerifySignatureRequest();
    request.requestBody({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    });

    const response = await client.execute(request);
    const verification = response.result as any;

    return verification.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification failed:', error);
    return false;
  }
}
