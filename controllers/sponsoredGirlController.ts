import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SponsoredGirlModel } from '../models/SponsoredGirl';
import { SponsorshipModel } from '../models/Sponsorship';

export async function getAllSponsoredGirls(req: Request, res: Response): Promise<void> {
  try {
    const girls = await SponsoredGirlModel.find().sort({ createdAt: -1, name: 1 }).lean();

    const activeCounts = await SponsorshipModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$sponsoredGirlId', sponsorCount: { $sum: 1 } } }
    ]);

    const countsByGirl = new Map(activeCounts.map((item: any) => [String(item._id), item.sponsorCount]));

    const response = girls.map((girl: any) => ({
      ...girl,
      sponsorCount: countsByGirl.get(String(girl._id)) || 0,
    }));

    res.status(200).json({
      success: true,
      girls: response,
      total: response.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load sponsored girls', error: error?.message || String(error) });
  }
}

export async function createSponsoredGirl(req: Request, res: Response): Promise<void> {
  try {
    const { name, country, age, dream, description, sentenceInTheirWords, situation, image, status } = req.body;

    if (!name || !country) {
      res.status(400).json({ success: false, message: 'Missing required fields: name, country' });
      return;
    }

    const created = await SponsoredGirlModel.findOneAndUpdate(
      { name, country },
      {
        $set: {
          age,
          dream,
          description,
          sentenceInTheirWords,
          situation,
          image,
          status: status || 'Available for Sponsorship',
        },
        $setOnInsert: {
          sponsors: [],
          sponsorshipStartDate: new Date(),
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, girl: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create sponsored girl', error: error?.message || String(error) });
  }
}

export async function getSponsorsForGirl(req: Request, res: Response): Promise<void> {
  try {
    const { girlId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(girlId)) {
      res.status(400).json({ success: false, message: 'Invalid girlId' });
      return;
    }

    const sponsors = await SponsorshipModel.find({
      sponsoredGirlId: new mongoose.Types.ObjectId(girlId),
      status: 'active',
    })
      .populate('donorId', 'name email phone country isSponsor sponsorshipLevel')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, sponsors, total: sponsors.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load girl sponsors', error: error?.message || String(error) });
  }
}
