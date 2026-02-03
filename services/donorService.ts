import nodemailer from 'nodemailer';
import { Donors } from '../models/donor';

export function validateDonor(donor: Partial<Donors>): boolean {
  if (!donor.name || typeof donor.name !== 'string') return false;
  if (!donor.country || typeof donor.country !== 'string') return false;
  if (!donor.contactid || typeof donor.contactid !== 'string') return false;
  return true;
}

export async function sendThankYouEmail(donor: Donors): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
  });
  // Add email sending logic here
}

export function generateReceipt(donor: Donors): string {
  return `
    Thank you, ${donor.name}!
    Country: ${donor.country}
    Contact ID: ${donor.contactid}
  `;
}








