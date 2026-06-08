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
    const { name, organization, amount, currency, applicationDate, deadline, description, status } = req.body;
    
    if (!name || !organization || !amount || !applicationDate || !deadline || !description) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const count = await GrantModel.countDocuments();
    const id = `G${String(count + 1).padStart(3, '0')}`;

    const grant = await GrantModel.create({
      id,
      name,
      organization,
      amount,
      currency: currency || 'USD',
      applicationDate,
      deadline,
      description,
      status: status || 'applied',
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
