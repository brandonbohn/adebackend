"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDonor = validateDonor;
exports.sendThankYouEmail = sendThankYouEmail;
exports.generateReceipt = generateReceipt;
const nodemailer_1 = __importDefault(require("nodemailer"));
function validateDonor(donor) {
    if (!donor.name || typeof donor.name !== 'string')
        return false;
    if (!donor.country || typeof donor.country !== 'string')
        return false;
    if (!donor.amount || typeof donor.amount !== 'number')
        return false;
    return true;
}
async function sendThankYouEmail(donor) {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
    });
    // Add email sending logic here
}
function generateReceipt(donor) {
    return `
    Thank you, ${donor.name}!
    Amount: ${donor.amount} 
    Date: ${donor.donationDate}
    Country: ${donor.country}
    Transaction ID: ${donor._id}
  `;
}
