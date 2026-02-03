import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import DonationModel from '../models/donations';

interface Donation {
    amount: number;
    date: string;
    donationType: string;
    message?: string;
    currency: string;
    donorid?: string;
}

export async function getAllDonations(req: Request, res: Response): Promise<void> {
    try {
        const donations = await DonationModel.find();
        res.status(200).json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createDonation(req: Request, res: Response): Promise<void> {
    try {
        const { donorId, amount, currency, message, donationType } = req.body;

        if (!amount) {
            res.status(400).json({ message: 'Missing required field: amount' });
            return;
        }

        const newDonation = await DonationModel.create({
            donorid: donorId,
            amount,
            date: new Date(),
            donationType: donationType || 'general',
            message,
            currency: currency || 'USD'
        });

        console.log(`✓ Donation created${donorId ? ` for donor ${donorId}` : ''}`);

        res.status(201).json({
            message: 'Donation recorded successfully',
            donation: newDonation
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}