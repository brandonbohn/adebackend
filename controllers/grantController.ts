import { Request, Response } from 'express';
import GrantModel from '../models/grant';

export async function getAllGrants(req: Request, res: Response): Promise<void> {
  try {
    const grants = await GrantModel.find().sort({ createdDate: -1 });
    res.json(grants);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching grants', error: error.message });
  }
}

export async function getGrantById(req: Request, res: Response): Promise<void> {
  try {
    const grant = await GrantModel.findOne({ id: req.params.id });
    if (!grant) {
      res.status(404).json({ message: 'Grant not found' });
      return;
    }
    res.json(grant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching grant', error: error.message });
  }
}

export async function createGrant(req: Request, res: Response): Promise<void> {
  try {
    const { title, funder, company, sourceUrl, researchDate, deadline, nextActionDate, contactName, contactEmail, contactPhone, amountAwarded, amountReceived, startDate, endDate, status, purpose, requirements, notes } = req.body;
    
    if (!title || !funder) {
      res.status(400).json({ message: 'Missing required fields: title, funder' });
      return;
    }

    const count = await GrantModel.countDocuments();
    const id = `G${String(count + 1).padStart(3, '0')}`;

    const grant = await GrantModel.create({
      id,
      title,
      funder,
      company: company || undefined,
      sourceUrl: sourceUrl || undefined,
      researchDate: researchDate || undefined,
      deadline: deadline || undefined,
      nextActionDate: nextActionDate || undefined,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      amountAwarded: amountAwarded || 0,
      amountReceived: amountReceived || 0,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || 'pipeline',
      purpose: purpose || undefined,
      requirements: requirements || [],
      notes: notes || undefined,
      createdDate: new Date().toISOString().split('T')[0]
    });

    res.status(201).json(grant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating grant', error: error.message });
  }
}

export async function updateGrant(req: Request, res: Response): Promise<void> {
  try {
    const grant = await GrantModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!grant) {
      res.status(404).json({ message: 'Grant not found' });
      return;
    }

    res.json(grant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating grant', error: error.message });
  }
}

export async function deleteGrant(req: Request, res: Response): Promise<void> {
  try {
    const grant = await GrantModel.findOneAndDelete({ id: req.params.id });
    
    if (!grant) {
      res.status(404).json({ message: 'Grant not found' });
      return;
    }

    res.json({ message: 'Grant deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting grant', error: error.message });
  }
}
