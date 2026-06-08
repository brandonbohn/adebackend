import { Request, Response } from 'express';
import ParticipantModel from '../models/participant';

export async function getAllParticipants(req: Request, res: Response): Promise<void> {
  try {
    const participants = await ParticipantModel.find().sort({ createdAt: -1 });
    res.json(participants);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching participants', error: error.message });
  }
}

export async function getParticipantById(req: Request, res: Response): Promise<void> {
  try {
    const participant = await ParticipantModel.findOne({ id: req.params.id });
    if (!participant) {
      res.status(404).json({ message: 'Participant not found' });
      return;
    }
    res.json(participant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching participant', error: error.message });
  }
}

export async function createParticipant(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, programId, programName, category, gender, age, status, guardianName, phone, location, notes } = req.body;
    
    if (!fullName || !programId || !programName || !category || !gender || !status) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const count = await ParticipantModel.countDocuments();
    const id = `P${String(count + 1).padStart(3, '0')}`;
    
    const participant = await ParticipantModel.create({
      id,
      fullName,
      programId,
      programName,
      category,
      gender,
      age: age || undefined,
      status,
      guardianName: guardianName || undefined,
      phone: phone || undefined,
      location: location || undefined,
      notes: notes || undefined
    });

    res.status(201).json(participant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating participant', error: error.message });
  }
}

export async function updateParticipant(req: Request, res: Response): Promise<void> {
  try {
    const participant = await ParticipantModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!participant) {
      res.status(404).json({ message: 'Participant not found' });
      return;
    }

    res.json(participant);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating participant', error: error.message });
  }
}

export async function deleteParticipant(req: Request, res: Response): Promise<void> {
  try {
    const participant = await ParticipantModel.findOneAndDelete({ id: req.params.id });
    
    if (!participant) {
      res.status(404).json({ message: 'Participant not found' });
      return;
    }

    res.json({ message: 'Participant deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting participant', error: error.message });
  }
}
