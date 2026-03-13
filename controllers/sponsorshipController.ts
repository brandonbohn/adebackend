import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SponsorshipModel } from '../models/Sponsorship';

function mapCadence(levelOrPlan: string): 'monthly' | 'annual' | 'one_time' {
  const value = String(levelOrPlan || '').toLowerCase();
  if (value.includes('annual')) return 'annual';
  if (value.includes('one') || value.includes('once')) return 'one_time';
  return 'monthly';
}

export async function createSponsorship(req: Request, res: Response): Promise<void> {
  try {
    const { donorId, sponsoredGirlId, sponsorshipLevel, amount, source, notes } = req.body;

    if (!donorId || !sponsoredGirlId || !sponsorshipLevel || !amount) {
      res.status(400).json({ success: false, message: 'Missing required fields: donorId, sponsoredGirlId, sponsorshipLevel, amount' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(donorId) || !mongoose.Types.ObjectId.isValid(sponsoredGirlId)) {
      res.status(400).json({ success: false, message: 'Invalid donorId or sponsoredGirlId' });
      return;
    }

    const sponsorship = await SponsorshipModel.findOneAndUpdate(
      {
        donorId: new mongoose.Types.ObjectId(donorId),
        sponsoredGirlId: new mongoose.Types.ObjectId(sponsoredGirlId),
        status: 'active',
      },
      {
        $setOnInsert: {
          donorId: new mongoose.Types.ObjectId(donorId),
          sponsoredGirlId: new mongoose.Types.ObjectId(sponsoredGirlId),
          startDate: new Date(),
        },
        $set: {
          sponsorshipLevel,
          amount: Number(amount),
          cadence: mapCadence(String(sponsorshipLevel)),
          source,
          notes,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, sponsorship });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create sponsorship', error: error?.message || String(error) });
  }
}

export async function getSponsorships(req: Request, res: Response): Promise<void> {
  try {
    const { donorId, sponsoredGirlId, status } = req.query;

    const filter: any = {};
    if (donorId && mongoose.Types.ObjectId.isValid(String(donorId))) {
      filter.donorId = new mongoose.Types.ObjectId(String(donorId));
    }
    if (sponsoredGirlId && mongoose.Types.ObjectId.isValid(String(sponsoredGirlId))) {
      filter.sponsoredGirlId = new mongoose.Types.ObjectId(String(sponsoredGirlId));
    }
    if (status) {
      filter.status = String(status);
    }

    const sponsorships = await SponsorshipModel.find(filter)
      .populate('donorId', 'name email country isSponsor sponsorshipLevel')
      .populate('sponsoredGirlId', 'name country status')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, sponsorships, total: sponsorships.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load sponsorships', error: error?.message || String(error) });
  }
}

export async function updateSponsorshipStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid sponsorship id' });
      return;
    }

    if (!['active', 'paused', 'cancelled'].includes(String(status))) {
      res.status(400).json({ success: false, message: 'Invalid status. Use active, paused, or cancelled' });
      return;
    }

    const update: any = { status };
    if (status === 'cancelled') {
      update.endDate = new Date();
    }

    const updated = await SponsorshipModel.findByIdAndUpdate(id, { $set: update }, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sponsorship not found' });
      return;
    }

    res.status(200).json({ success: true, sponsorship: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update sponsorship status', error: error?.message || String(error) });
  }
}
