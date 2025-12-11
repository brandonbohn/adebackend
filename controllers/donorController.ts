

import { Request, Response } from 'express';
import { DonorModel } from '../models/donor';

// ...existing code...

export async function addDonor(req: Request, res: Response): Promise<void> {
    const { name, amount, country, donationDate } = req.body;
    try {
        await DonorModel.create({ name, amount, country, donationDate });
        res.status(201).send({ message: 'Donor added successfully' });
    } catch (error) {
        console.error('Error adding donor:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export async function getDonors(req: Request, res: Response): Promise<void> {
    try {
        const donors = await DonorModel.find();
        res.status(200).json(donors);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export async function getDonorById(req: Request, res: Response): Promise<void> {
    const donorId = req.params.id;
    try {
        const donor = await DonorModel.findById(donorId);
        if (donor) {
            res.status(200).json(donor);
        } else {
            res.status(404).send({ message: 'Donor not found' });
        }
    } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export async function deleteDonor(req: Request, res: Response): Promise<void> {
    const donorId = req.params.id;
    try {
        await DonorModel.findByIdAndDelete(donorId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}