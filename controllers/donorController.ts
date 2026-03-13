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
    isSponsor?: boolean;
    sponsorshipLevel?: 'starter' | 'basic' | 'full' | 'premium';
}

function normalizePaymentProvider(value: unknown): 'paypal' | 'flutterwave' | 'mpesa' {
    const normalized = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[-_\s]/g, '');

    if (normalized === 'paypal') return 'paypal';
    if (normalized === 'flutterwave') return 'flutterwave';
    if (normalized === 'mpesa') return 'mpesa';

    return 'paypal';
}

function normalizeApiBaseUrl(url: string): string {
    // Render should always be served over HTTPS for redirect URLs.
    if (url.includes('onrender.com') && url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
}

function getDonationTypeFromRequest(req: Request): 'general' | 'recurring' {
    const source = String(req.body?.source || '').toLowerCase();
    const sponsorType = String(req.body?.sponsorType || '').toLowerCase();
    const sponsorshipPlan = String(req.body?.sponsorshipPlan || '').toLowerCase();

    if (source.includes('sponsorship') || sponsorType === 'girl' || sponsorshipPlan) {
        return 'recurring';
    }

    return 'general';
}

function getSponsorshipLevel(sponsorshipPlan: unknown): 'starter' | 'basic' | 'full' | 'premium' | undefined {
    const plan = String(sponsorshipPlan || '').toLowerCase();

    if (!plan) return undefined;
    if (plan.includes('monthly-21') || plan.includes('starter')) return 'starter';
    if (plan.includes('annual-250') || plan.includes('basic')) return 'basic';
    if (plan.includes('annual-500') || plan.includes('full')) return 'full';
    if (plan.includes('annual-1000') || plan.includes('premium')) return 'premium';

    return undefined;
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

        const isSponsor = String(req.body?.sponsorType || '').toLowerCase() === 'girl'
            || String(req.body?.source || '').toLowerCase().includes('sponsorship')
            || !!req.body?.sponsorshipPlan;
        const sponsorshipLevel = getSponsorshipLevel(req.body?.sponsorshipPlan);

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
                    isSponsor,
                    ...(sponsorshipLevel ? { sponsorshipLevel } : {}),
                },
            },
            { upsert: true, new: true }
        );

        // Create donation record if amount is provided
        let donation = null;
        if (amount) {
            const donationType = getDonationTypeFromRequest(req);
            const sponsorshipMeta = {
                source: req.body?.source,
                sponsorType: req.body?.sponsorType,
                selectedGirl: req.body?.selectedGirl,
                selectedGirlId: req.body?.selectedGirlId,
                sponsorshipPlan: req.body?.sponsorshipPlan,
            };
            const hasSponsorshipMeta = Object.values(sponsorshipMeta).some((value) => value !== undefined && value !== '');

            donation = await DonationModel.create({
                donorid: existingDonor._id as any,
                amount: parseFloat(amount),
                date: new Date(),
                donationType,
                message: hasSponsorshipMeta
                    ? `${req.body.message || ''}${req.body.message ? ' ' : ''}${JSON.stringify(sponsorshipMeta)}`
                    : (req.body.message || ''),
                currency: currency || 'USD',
                paymentProvider: amount && paymentMethod ? normalizePaymentProvider(paymentMethod) : undefined,
                paymentStatus: amount && paymentMethod ? 'PENDING' : undefined,
            });
            console.log(`💰 Created donation record: ${donation._id} for ${amount} ${currency}`);
        }

        // Generate payment URL if amount and payment method provided
        let paymentUrl = null;
        if (amount && paymentMethod) {
            const forwardedProto = req.get('x-forwarded-proto');
            const forwardedHost = req.get('x-forwarded-host');
            const requestBaseUrl = forwardedHost
                ? `${forwardedProto || 'https'}://${forwardedHost}`
                : `${req.protocol}://${req.get('host')}`;
            const rawApiBaseUrl = process.env.API_BASE_URL || process.env.API_URL || requestBaseUrl || 'https://adebackend.onrender.com';
            const apiBaseUrl = normalizeApiBaseUrl(rawApiBaseUrl);
            const provider = normalizePaymentProvider(paymentMethod);
            
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