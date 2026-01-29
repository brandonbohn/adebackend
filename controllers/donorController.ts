import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { sendEmail, generateDonationReceipt } from '../utils/emailservice';

// Based on your donor.ts model
interface Donor {
    _id: string;
    name: string;
    amount: number;
    country: string;
    donationDate: string;
    donations: Donation[];
    email?: string;
    phone?: string;
    status?: string;
    source?: string;
    contactId?: string;
    notes?: string;
}

interface Donation {
    donorId: string;
    amount: number;
    date: string;
    message?: string;
    currency?: string;
    paymentMethod?: string;
    transactionId?: string;
}

const donorsFilePath = path.join(__dirname, '../json/donors.json');
const donationsFilePath = path.join(__dirname, '../json/donations.json');

function readDonors(): Donor[] {
    try {
        if (!fs.existsSync(donorsFilePath)) {
            fs.writeFileSync(donorsFilePath, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(donorsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading donors file:', error);
        return [];
    }
}

function writeDonors(donors: Donor[]): void {
    try {
        fs.writeFileSync(donorsFilePath, JSON.stringify(donors, null, 2));
    } catch (error) {
        console.error('Error writing donors file:', error);
        throw error;
    }
}

function readDonations(): Donation[] {
    try {
        if (!fs.existsSync(donationsFilePath)) {
            fs.writeFileSync(donationsFilePath, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(donationsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading donations file:', error);
        return [];
    }
}

function writeDonations(donations: Donation[]): void {
    try {
        fs.writeFileSync(donationsFilePath, JSON.stringify(donations, null, 2));
    } catch (error) {
        console.error('Error writing donations file:', error);
        throw error;
    }
}

export async function addDonor(req: Request, res: Response): Promise<void> {
    try {
        console.log('📥 Donation submission received:', JSON.stringify(req.body, null, 2));
        let { name, amount, currency, country, message, paymentMethod, transactionId, email } = req.body;
        
        // Handle firstName/lastName format from donation form
        if (!name && (req.body.firstName || req.body.lastName)) {
            name = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
            email = req.body.email || email;
            country = req.body.country || 'Not specified';
        }
        
        // Validation based on IDonor model
        if (!name || !amount) {
            res.status(400).json({ message: 'Missing required fields: name, amount' });
            return;
        }
        
        // Set default country if not provided
        if (!country) {
            country = 'Not specified';
        }

        const donors = readDonors();
        const donations = readDonations();
        
        // Check if donor already exists by name (you might want email instead)
        let existingDonor = donors.find(d => d.name.toLowerCase() === name.toLowerCase());
        
        if (existingDonor) {
            // Update existing donor
            const newDonation: Donation = {
                donorId: existingDonor._id,
                amount,
                date: new Date().toISOString(),
                message,
                currency,
                paymentMethod,
                transactionId
            };
            
            existingDonor.amount += amount; // Update total amount
            existingDonor.donations.push(newDonation);
            donations.push(newDonation);

        if (email && !existingDonor.email) {
                existingDonor.email = email;
            }
            
            writeDonors(donors);
            writeDonations(donations);
            
            // Send receipt email if donor has email
            if (existingDonor.email) {
                const receiptHtml = generateDonationReceipt(
                    existingDonor.name,
                    amount,
                    newDonation.date,
                    transactionId || 'N/A',
                    currency || 'USD'
                );
                await sendEmail({
                    to: existingDonor.email,
                    subject: 'Your Donation Receipt - ADE Organization',
                    text: `Dear ${existingDonor.name}, Thank you for your donation of ${currency || 'USD'} ${amount}. Transaction ID: ${transactionId || 'N/A'}`,
                    html: receiptHtml
                });
            }
            
            res.status(201).json({ 
                message: 'Donation added to existing donor', 
                donor: existingDonor,
                donation: newDonation 
            });
        } else {
            // Create new donor
            const donorId = randomUUID();
            const newDonation: Donation = {
                donorId,
                amount,
                date: new Date().toISOString(),
                message,
                currency,
                paymentMethod,
                transactionId
            };
            
            const newDonor: Donor = {
                _id: donorId,
                name,
                amount,
                country,
                donationDate: new Date().toISOString(),
                donations: [newDonation],
                email: email || undefined
            };

            donors.push(newDonor);
            donations.push(newDonation);
            
            writeDonors(donors);
            writeDonations(donations);

            // Send receipt email if donor provided email
            if (email) {
                const receiptHtml = generateDonationReceipt(
                    name,
                    amount,
                    newDonation.date,
                    transactionId || 'N/A',
                    currency || 'USD'
                );
                await sendEmail({
                    to: email,
                    subject: 'Your Donation Receipt - ADE Organization',
                    text: `Dear ${name}, Thank you for your donation of ${currency || 'USD'} ${amount}. Transaction ID: ${transactionId || 'N/A'}`,
                    html: receiptHtml
                });
            }

            res.status(201).json({ 
                message: 'New donor added successfully', 
                donor: newDonor,
                donation: newDonation 
            });
        }
    } catch (error) {
        console.error('Error adding donor:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        res.status(500).json({ 
            message: 'Internal server error',
            error: errorMessage
        });
    }
}

export async function getAllDonors(req: Request, res: Response): Promise<void> {
    try {
        const donors = readDonors();
        res.status(200).json(donors);
    } catch (error) {
        console.error('Error getting donors:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getDonorById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const donors = readDonors();
        const donor = donors.find(d => d._id === id);

        if (!donor) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }

        res.status(200).json(donor);
    } catch (error) {
        console.error('Error getting donor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deleteDonor(req: Request, res: Response): Promise<void> {
    try {
        const donorId = req.params.id;
        const donors = readDonors();
        const donations = readDonations();
        
        const filteredDonors = donors.filter(d => d._id !== donorId);
        
        if (donors.length === filteredDonors.length) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }
        
        // Also remove associated donations
        const filteredDonations = donations.filter(d => d.donorId !== donorId);
        
        writeDonors(filteredDonors);
        writeDonations(filteredDonations);
        
        res.status(200).json({ message: 'Donor and associated donations deleted successfully' });
    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllDonations(req: Request, res: Response): Promise<void> {
    try {
        const donations = readDonations();
        res.status(200).json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createDonation(req: Request, res: Response): Promise<void> {
    try {
        const { donorId, amount, currency, message, paymentMethod, transactionId } = req.body;
        
        if (!donorId || !amount) {
            res.status(400).json({ message: 'Missing required fields: donorId, amount' });
            return;
        }

        const donations = readDonations();
        const newDonation: Donation = {
            donorId,
            amount,
            date: new Date().toISOString(),
            message,
            currency: currency || 'USD',
            paymentMethod: paymentMethod || 'unknown',
            transactionId: transactionId || `txn-${randomUUID()}`
        };

        donations.push(newDonation);
        writeDonations(donations);
        
        console.log(`✓ Donation created: ${newDonation.transactionId} from donor ${donorId}`);

        res.status(201).json({ 
            message: 'Donation recorded successfully',
            donation: newDonation 
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}