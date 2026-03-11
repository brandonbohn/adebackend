type DarijaEnvironment = {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
};

export type StkPushInput = {
    amount: number;
    phoneNumber: string;
    accountReference?: string;
    transactionDesc?: string;
};

export type StkPushResult = {
    success: boolean;
    message: string;
    merchantRequestId?: string;
    checkoutRequestId?: string;
    responseCode?: string;
    responseDescription?: string;
    customerMessage?: string;
};

export type ParsedStkCallback = {
    merchantRequestId?: string;
    checkoutRequestId?: string;
    resultCode?: number;
    resultDesc?: string;
    amount?: number;
    mpesaReceiptNumber?: string;
    transactionDate?: number;
    phoneNumber?: string;
};

function getDarijaEnvironment(): DarijaEnvironment {
    const clientId = process.env.MPESA_CONSUMER_KEY;
    const clientSecret = process.env.MPESA_CONSUMER_SECRET;
    const mode = (process.env.MPESA_MODE || process.env.MPESA_ENV || 'sandbox').toLowerCase();

    if (!clientId || !clientSecret) {
        throw new Error('Darija credentials not configured in environment variables');
    }

    const baseUrl = mode === 'live' || mode === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    return { clientId, clientSecret, baseUrl };
}

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not configured`);
    }
    return value;
}

function buildTimestamp(): string {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');

    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function normalizeKenyanPhone(rawPhone: string): string {
    const phone = rawPhone.replace(/\D/g, '');

    if (phone.startsWith('254') && phone.length === 12) {
        return phone;
    }

    if (phone.startsWith('07') && phone.length === 10) {
        return `254${phone.slice(1)}`;
    }

    if (phone.startsWith('7') && phone.length === 9) {
        return `254${phone}`;
    }

    throw new Error('Invalid Kenyan phone number format. Use 07XXXXXXXX or 2547XXXXXXXX');
}

export async function getAccessToken(): Promise<string> {
    const { clientId, clientSecret, baseUrl } = getDarijaEnvironment();
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} ${errorBody}`);
    }

    const data = await response.json() as { access_token?: string };
    if (!data.access_token || typeof data.access_token !== 'string') {
        throw new Error('Darija token response missing access_token');
    }

    return data.access_token;
}

export async function initiateStkPush(input: StkPushInput): Promise<StkPushResult> {
    if (!Number.isInteger(input.amount) || input.amount <= 0) {
        throw new Error('Amount must be a positive integer');
    }

    const token = await getAccessToken();
    const { baseUrl } = getDarijaEnvironment();
    const shortCode = getRequiredEnv('MPESA_SHORTCODE');
    const passkey = getRequiredEnv('MPESA_PASSKEY');
    const callbackUrl = getRequiredEnv('MPESA_CALLBACK_URL');

    const timestamp = buildTimestamp();
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    const normalizedPhone = normalizeKenyanPhone(input.phoneNumber);

    const payload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: input.amount,
        PartyA: normalizedPhone,
        PartyB: shortCode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: input.accountReference || 'ADE-DONATION',
        TransactionDesc: input.transactionDesc || 'Donation to ADE Foundation'
    };

    const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseData = await response.json() as {
        MerchantRequestID?: string;
        CheckoutRequestID?: string;
        ResponseCode?: string;
        ResponseDescription?: string;
        CustomerMessage?: string;
        errorMessage?: string;
    };

    if (!response.ok) {
        throw new Error(`Failed to initiate STK push: ${response.status} ${response.statusText} ${responseData.errorMessage || ''}`);
    }

    return {
        success: responseData.ResponseCode === '0',
        message: responseData.CustomerMessage || responseData.ResponseDescription || 'STK push response received',
        merchantRequestId: responseData.MerchantRequestID,
        checkoutRequestId: responseData.CheckoutRequestID,
        responseCode: responseData.ResponseCode,
        responseDescription: responseData.ResponseDescription,
        customerMessage: responseData.CustomerMessage
    };
}

export function parseStkCallback(callbackBody: any): ParsedStkCallback {
    const stkCallback = callbackBody?.Body?.stkCallback;
    const metadataItems = stkCallback?.CallbackMetadata?.Item as Array<{ Name: string; Value?: any }> | undefined;
    const metadataMap = new Map<string, any>();

    if (Array.isArray(metadataItems)) {
        for (const item of metadataItems) {
            metadataMap.set(item.Name, item.Value);
        }
    }

    return {
        merchantRequestId: stkCallback?.MerchantRequestID,
        checkoutRequestId: stkCallback?.CheckoutRequestID,
        resultCode: stkCallback?.ResultCode,
        resultDesc: stkCallback?.ResultDesc,
        amount: metadataMap.get('Amount'),
        mpesaReceiptNumber: metadataMap.get('MpesaReceiptNumber'),
        transactionDate: metadataMap.get('TransactionDate'),
        phoneNumber: metadataMap.get('PhoneNumber')
    };
}
