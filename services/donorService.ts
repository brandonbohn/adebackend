import nodemailer from 'nodemailer';



import { IDonor } from '../models/donor';

export function validateDonor(donor: Partial<IDonor>): boolean {
  if (!donor.name || typeof donor.name !== 'string') return false;
  if (!donor.country || typeof donor.country !== 'string') return false;
  if (!donor.amount || typeof donor.amount !== 'number') return false;
  return true;
}

export async function sendThankYouEmail(donor: IDonor): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
  });
  // Add email sending logic here
}

export function generateReceipt(donor: IDonor): string {
  return `
    Thank you, ${donor.name}!
    Amount: ${donor.amount} 
    Date: ${donor.donationDate}
    Country: ${donor.country}
    Transaction ID: ${donor._id}
  `;
}








