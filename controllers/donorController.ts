import { Request, Response } from 'express';
import DonorsModel from '../models/donor';
import DonationModel from '../models/donations';
import { upsertContactInfo } from '../services/contactInfoService';





// Based on your donor.ts model
interface Donors {
    _id?: string;
    name: string;
    country: string;
    contactid: string;
    pastDonations?: any[];
    source?: string;
    notes?: string;
    email?: string;
    phone?: string;
}

const findAllDonors = async () => DonorsModel.find().populate('contactid');
const createDonor = async (doc: Partial<Donors>) => DonorsModel.create(doc);
const findDonorById = async (id: string) => DonorsModel.findById(id).populate('contactid');
const deleteDonorById = async (id: string) => DonorsModel.findByIdAndDelete(id);

export async function addDonor(req: Request, res: Response): Promise<void> {
    try {
        console.log('📥 Donor submission received:', JSON.stringify(req.body, null, 2));
        let { name, country, email, phone, source, notes, amount, currency, paymentMethod } = req.body;
        
        // Handle firstName/lastName format from donation form
        if (!name && (req.body.firstName || req.body.lastName)) {
            name = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
            email = req.body.email || email;
            country = req.body.country || 'Not specified';
        }
        
        // Validation based on Donor model
        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }
        
        // Set default country if not provided
        if (!country) {
            country = 'Not specified';
        }

        // Upsert ContactInfo by email (or phone) and use its _id as contactid
        const contact = await upsertContactInfo({ name, email, phone, country });

        // Check if donor already exists by contactid
        let existingDonor = await DonorsModel.findOneAndUpdate(
            { contactid: contact._id as any },
            {
                $setOnInsert: {
                    name,
                    country,
                    contactid: contact._id as any,
                },
                $set: {
                    ...(email ? { email } : {}),
                    ...(phone ? { phone } : {}),
                    ...(source ? { source } : {}),
                    ...(notes ? { notes } : {}),
                },
            },
            { upsert: true, new: true }
        );

        // Create donation record if amount is provided
        let donation = null;
        if (amount) {
            donation = await DonationModel.create({
                donorid: existingDonor._id as any,
                amount: parseFloat(amount),
                date: new Date(),
                donationType: 'general',
                message: req.body.message || '',
                currency: currency || 'USD'
            });
            console.log(`💰 Created donation record: ${donation._id} for ${amount} ${currency}`);
        }

        // Generate payment URL if amount and payment method provided
        let paymentUrl = null;
        if (amount && paymentMethod) {
            const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
            const provider = paymentMethod === 'paypal' ? 'paypal' 
                           : paymentMethod === 'flutterwave' ? 'flutterwave'
                           : paymentMethod === 'mpesa' ? 'mpesa'
                           : 'paypal'; // default
            
            const params = new URLSearchParams({
                provider,
                amount: String(amount),
                currency: currency || 'USD',
                donorId: String(existingDonor._id),
                donationId: donation ? String(donation._id) : '',
                name,
                email: email || '',
                phone: phone || ''
            });
            
            paymentUrl = `${apiBaseUrl}/api/payments/checkout?${params.toString()}`;
            console.log(`💳 Generated payment URL for ${provider}: ${paymentUrl}`);
        }

        res.status(200).json({
            success: true,
            message: 'Donor and donation recorded successfully',
            donor: existingDonor,
            donation: donation,
            ...(paymentUrl && { paymentUrl, redirect: true })
        });
    } catch (error) {
        console.error('Error adding donor:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: errorMessage
        });
    }
}

export async function getAllDonors(req: Request, res: Response): Promise<void> {
    try {
        const donors = await findAllDonors();
        res.status(200).json(donors);
    } catch (error) {
        console.error('Error getting donors:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getDonorById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const donor = await findDonorById(id);

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
        const donor = await deleteDonorById(donorId);

        if (!donor) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }

        res.status(200).json({ message: 'Donor deleted successfully' });
    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}