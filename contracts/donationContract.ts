/**
 * ADE (Africa Development and Empowerment) - Data Contracts
 * Community-Based Organization in Nairobi, Kenya
 * 
 * Mission: Empowering girls in Kibera through education and football
 * Target Audience: Global donors supporting girls' education in Kenya
 */

// ============================================
// REQUEST CONTRACTS (Frontend -> Backend)
// ============================================

/**
 * Donor Information - Step 1 of donation flow
 * POST /api/donors
 * 
 * Captures donor details before payment processing
 * Supports both local (Kenya) and international donors
 */
export interface CreateDonorRequest {
  firstName: string;          // min 2 chars
  lastName: string;           // min 2 chars
  email: string;              // valid email format
  phone: string;              // supports international format (+country code)
  country?: string;           // donor's country (important for tax receipts)
  anonymousDonation?: boolean; // default: false - hide donor name publicly
  message?: string;           // optional message to the girls/team
}

/**
 * Donation/Payment Information - Step 2 of donation flow
 * POST /api/payments/process-payment
 * 
 * Processes payment after donor info is captured
 * Supports Kenyan (M-Pesa) and international (PayPal/Stripe) payments
 */
export interface ProcessPaymentRequest {
  donorId: string;            // returned from CreateDonorRequest
  amount: number;             // donation amount (validated by currency)
  currency: 'USD' | 'KES';    // USD for international, KES for local
  donationType: 'one-time' | 'monthly'; // one-time or recurring support
  paymentMethod: 'paypal' | 'mpesa' | 'stripe' | 'card'; // payment provider
  
  // Optional: Dedicate donation to someone
  dedication?: {
    type: 'in-honor' | 'in-memory';
    name: string;             // person being honored
    notifyEmail?: string;     // send notification to this email
  };
  
  // Optional: Specify donation purpose
  program?: 'general' | 'school-fees' | 'football-equipment' | 'meals' | 'uniforms';
  
  // Optional: Donor message
  message?: string;           // message to the ADE team/girls
}

/**
 * Volunteer Interest Form
 * POST /api/volunteers
 * 
 * Captures volunteer interest for local (Nairobi) and remote opportunities
 */
export interface CreateVolunteerRequest {
  name: string;
  email: string;
  phone: string;
  location: string;           // city/country
  basedIn: 'nairobi' | 'kenya' | 'remote'; // location type
  availability: string;       // e.g. "weekends", "evenings", "flexible"
  
  // Areas of interest
  interests: Array<
    | 'coaching'              // Football coaching
    | 'tutoring'              // Academic tutoring
    | 'mentorship'            // Life skills & guidance
    | 'nutrition'             // Meal program support
    | 'marketing'             // Social media, storytelling
    | 'operations'            // Admin, logistics
    | 'fundraising'           // Donor outreach
    | 'photography'           // Documenting impact
    | 'other'
  >;
  
  otherInterest?: string;     // if 'other' is selected
  experience?: string;        // relevant experience/skills
  languagesSpoken?: string[]; // important for Kibera work (Swahili, English, etc.)
}

// ============================================
// RESPONSE CONTRACTS (Backend -> Frontend)
// ============================================

/**
 * Response after creating donor
 * POST /api/donors -> 201 Created
 */
export interface CreateDonorResponse {
  success: true;
  message: string;            // e.g. "Thank you for supporting girls in Kibera!"
  donor: {
    _id: string;              // use this for payment request
    name: string;             // full name
    email: string;
    country?: string;
    createdAt: string;        // ISO date string
  };
}

/**
 * Response after processing payment
 * POST /api/payments/process-payment -> 200 OK
 */
export interface ProcessPaymentResponse {
  success: true;
  message: string;            // e.g. "Payment successful! You've changed a girl's life."
  transaction: {
    transactionId: string;    // payment provider transaction ID
    donorId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: 'completed' | 'pending' | 'failed';
    date: string;             // ISO date string
    program?: string;         // what the donation supports
  };
  receipt: {
    receiptNumber: string;    // ADE receipt number (for tax purposes)
    receiptUrl?: string;      // PDF receipt URL (optional)
    emailSent: boolean;       // confirmation email sent?
  };
  impact: {
    message: string;          // e.g. "Your KES 5,000 provides school fees for 1 girl for 1 term"
  };
}

/**
 * Response after volunteer submission
 * POST /api/volunteers -> 201 Created
 */
export interface CreateVolunteerResponse {
  success: true;
  message: string;            // e.g. "Thank you for your interest! We'll contact you soon."
  volunteer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    basedIn: string;
    interests: Array<string>; // What they can help with
    otherInterest?: string;   // Custom interest if provided
    availability: string;     // When they're available
    createdAt: string;
  };
}

/**
 * Get donation form configuration
 * GET /api/content/donationform -> 200 OK
 */
export interface DonationFormConfigResponse {
  donationForm: {
    title: string;
    subtitle: string;
    formFields: {
      donorInfo: Record<string, any>;
      donationType: Record<string, any>;
      amount: Record<string, any>;
      paymentMethod: Record<string, any>;
      dedication: Record<string, any>;
      anonymousDonation: Record<string, any>;
      comments: Record<string, any>;
    };
    apiEndpoint: {
      url: string;
      method: string;
    };
    validationRules: Record<string, any>;
    confirmationPage: Record<string, any>;
    errorMessages: Record<string, any>;
    successMessages: Record<string, any>;
  };
}

// ============================================
// ERROR CONTRACTS
// ============================================

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;             // e.g. 'INVALID_EMAIL', 'PAYMENT_FAILED', 'MPESA_TIMEOUT'
    message: string;          // user-friendly error message
    field?: string;           // which field caused the error (for validation)
    details?: any;            // additional error details
  };
}

// ============================================
// VALIDATION RULES (enforced by backend)
// ============================================

export const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9]{10,15}$/,
  kenyaPhone: /^(07|\+2547)[0-9]{8}$/,        // Kenyan mobile format
  
  // Minimum donation amounts (realistic for Kenyan context)
  minAmount: {
    USD: 5,      // ~$5 minimum for international
    KES: 100     // ~100 KES minimum for local donors
  },
  
  // Maximum amounts (fraud prevention)
  maxAmount: {
    USD: 100000,
    KES: 10000000
  },
  
  // Impact messaging thresholds (for KES)
  impactLevels: {
    100: "Provides a nutritious meal for 1 girl",
    500: "Buys school supplies for 1 girl",
    1000: "Provides football training for 1 week",
    2500: "Provides school uniform for 1 girl",
    5000: "Covers school fees for 1 girl for 1 term",
    10000: "Supports 1 girl for a full school term (fees + meals + supplies)"
  }
} as const;
