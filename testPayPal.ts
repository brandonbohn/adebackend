require('dotenv').config();
import { createPayPalOrder, capturePayPalOrder } from './services/paypalService';

async function testPayPal() {
  try {
    console.log('Testing PayPal order creation...');
    console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'set' : 'not set');
    console.log('PAYPAL_MODE:', process.env.PAYPAL_MODE);
    const { orderId, approvalUrl } = await createPayPalOrder(
      '10.00',
      'USD',
      'test-donor-123',
      'http://localhost:8080/api/payments/success?provider=paypal&donorId=test-donor-123',
      'http://localhost:8080/api/payments/cancel?provider=paypal&donorId=test-donor-123'
    );
    console.log('Order created:', orderId);
    console.log('Approval URL:', approvalUrl);

    // To test capture, you would need to approve the order first
    // console.log('Testing capture...');
    // const result = await capturePayPalOrder(orderId);
    // console.log('Capture result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPayPal();