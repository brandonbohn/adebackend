export interface PaymentProcessingRequest {
    amount: number;                // amount in smallest currency unit (e.g., cents)
    currency: string;             // currency code
    paymentOptionType: string;    // e.g., "mpesa", etc.
    paymentDetails: {             // provider-specific details
        [key: string]: any;       // dynamic fields based on provider
    };
}

export interface PaymentProcessingResponse {
    status: 'success' | 'error';
    provider: string;             // e.g., "paypal", "mpesa", "flutterwave", etc.
    transactionId?: string;       // generic transaction ID for all providers
    checkoutUrl?: string;         // for providers that use a checkout URL (e.g., Flutterwave)
    message: string;              // success or error message
    // Add more fields as needed for other providers
}