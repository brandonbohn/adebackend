import { Request, Response } from 'express';
import ProgramModel from '../models/program';

export async function getAllPrograms(req: Request, res: Response): Promise<void> {
  try {
    const programs = await ProgramModel.find().sort({ startDate: -1 });
    res.json(programs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching programs', error: error.message });
  }
}

export async function getProgramById(req: Request, res: Response): Promise<void> {
  try {
    const program = await ProgramModel.findOne({ id: req.params.id });
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }
    res.json(program);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching program', error: error.message });
  }
}

export async function createProgram(req: Request, res: Response): Promise<void> {
  try {
    const { id, name, description, budget, startDate, endDate, beneficiaries, location } = req.body;

    if (!id || !name || !description || !budget || !startDate || !endDate || !beneficiaries || !location) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existing = await ProgramModel.findOne({ id });
    if (existing) {
      res.status(400).json({ message: 'Program with this ID already exists' });
      return;
    }

    const newProgram = await ProgramModel.create({
      id,
      name,
      description,
      budget,
      spent: req.body.spent || 0,
      startDate,
      endDate,
      status: req.body.status || 'planned',
      beneficiaries,
      location
    });

    res.status(201).json(newProgram);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating program', error: error.message });
  }
}

export async function updateProgram(req: Request, res: Response): Promise<void> {
  try {
    const program = await ProgramModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    res.json(program);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating program', error: error.message });
  }
}

export async function deleteProgram(req: Request, res: Response): Promise<void> {
  try {
    const program = await ProgramModel.findOneAndDelete({ id: req.params.id });
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }
    res.json({ message: 'Program deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting program', error: error.message });
  }
}
