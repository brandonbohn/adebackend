import nodemailer from 'nodemailer';


interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
async function sendEmail(options: EmailOptions): Promise<boolean> {
    const mailOptions = {
        from: `"ADE Community Based Organization" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${options.to}:`, error);
        return false;
    }
}

function generateDonationReceipt(donorName: string, amount: number, date: string, transactionId: string, currency: string = 'USD'): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #4CAF50; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .receipt-title { font-size: 28px; font-weight: bold; margin: 0; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .receipt-details { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .receipt-label { font-weight: bold; color: #555; }
                .receipt-value { color: #333; }
                .amount-highlight { font-size: 24px; color: #4CAF50; font-weight: bold; text-align: center; margin: 20px 0; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 2px solid #4CAF50; margin-top: 20px; }
                .important-note { background-color: #fff3cd; padding: 10px; margin: 15px 0; border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <p class="receipt-title">DONATION RECEIPT</p>
                    <p style="margin: 5px 0;">ADE Community Based Organization</p>
                </div>
                <div class="content">
                    <p>Dear ${donorName},</p>
                    <p>Thank you for your generous donation! This receipt confirms your contribution to our organization.</p>
                    
                    <div class="receipt-details">
                        <div class="receipt-row">
                            <span class="receipt-label">Donor Name:</span>
                            <span class="receipt-value">${donorName}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Transaction ID:</span>
                            <span class="receipt-value">${transactionId}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Date:</span>
                            <span class="receipt-value">${date}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Amount:</span>
                            <span class="receipt-value">${currency} ${amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="amount-highlight">
                        Total Donation: ${currency} ${amount.toFixed(2)}
                    </div>

                    <div class="important-note">
                        <strong>Important:</strong> Please retain this receipt for your tax records. This donation may be tax-deductible.
                    </div>

                    <p>Your support makes a significant difference in our mission and helps us continue our important work in the community.</p>
                    
                    <p>With heartfelt thanks,<br><strong>The ADE Community Based Organization Team</strong></p>
                </div>
                <div class="footer">
                    <p><strong>ADE Community Based Organization</strong></p>
                    <p>Changing Lives, Building Futures</p>
                    <p>If you have any questions about this receipt, please contact us at ${process.env.EMAIL_USER}</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateContactConfirmationEmail(name: string, subject: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thank You for Contacting Us!</h1>
                </div>
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>We have received your message regarding: <strong>${subject}</strong></p>
                    <p>Our team will review your inquiry and get back to you within 24-48 hours.</p>
                    <p>If your matter is urgent, please call us directly.</p>
                    <p>Best regards,<br><strong>The ADE Community Based Organization Team</strong></p>
                </div>
                <div class="footer">
                    <p>ADE Community Based Organization | Changing Lives, Building Futures</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateAdminContactNotification(name: string, email: string, phone: string | undefined, reason: string, subject: string, message: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #ff9800; }
                .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #fff; }
                .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
                .message-box { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #ff9800; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🔔 New Contact Form Submission</h2>
                </div>
                <div class="content">
                    <div class="detail-row">
                        <span class="label">Name:</span>
                        <span>${name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span>${email}</span>
                    </div>
                    ${phone ? `<div class="detail-row">
                        <span class="label">Phone:</span>
                        <span>${phone}</span>
                    </div>` : ''}
                    <div class="detail-row">
                        <span class="label">Reason:</span>
                        <span>${reason}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Subject:</span>
                        <span>${subject}</span>
                    </div>
                    <div class="message-box">
                        <strong>Message:</strong><br>
                        ${message}
                    </div>
                    <p style="margin-top: 20px;"><strong>Action Required:</strong> Please respond to this inquiry within 24-48 hours.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export { sendEmail, generateDonationReceipt, generateContactConfirmationEmail, generateAdminContactNotification };