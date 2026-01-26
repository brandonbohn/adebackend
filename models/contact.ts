/**
 * Contact/Inquiry Model
 * For general contact form submissions (not donors or volunteers)
 */

export interface IContact {
  _id: string;
  name: string;
  organization?: string;        // Company/org they represent
  email: string;
  phone?: string;
  reason: 'volunteering' | 'donation' | 'partnership' | 'general' | 'other';
  subject: string;
  message: string;
  status?: 'new' | 'responded' | 'closed'; // Track if admin responded
  respondedAt?: string;         // When admin replied
  respondedBy?: string;         // Which admin replied
  notes?: string;               // Admin notes
  createdAt: string;
  updatedAt?: string;
}

/**
 * Contact Summary (for listings)
 */
export interface ContactSummary {
  _id: string;
  name: string;
  email: string;
  reason: string;
  subject: string;
  status: string;
  createdAt: string;
}
