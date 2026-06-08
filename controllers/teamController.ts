import { Request, Response } from 'express';
import TeamModel from '../models/team';

export async function getAllTeams(req: Request, res: Response): Promise<void> {
  try {
    const teams = await TeamModel.find().sort({ createdDate: -1 });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
}

export async function getTeamById(req: Request, res: Response): Promise<void> {
  try {
    const team = await TeamModel.findOne({ id: req.params.id });
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
}

export async function createTeam(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, coach, category, status } = req.body;
    
    if (!name || !description || !coach || !category) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const count = await TeamModel.countDocuments();
    const id = `T${String(count + 1).padStart(3, '0')}`;

    const team = await TeamModel.create({
      id,
      name,
      description,
      coach,
      category,
      status: status || 'active',
      createdDate: new Date().toISOString().split('T')[0]
    });

    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
}

export async function updateTeam(req: Request, res: Response): Promise<void> {
  try {
    const team = await TeamModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
}

export async function deleteTeam(req: Request, res: Response): Promise<void> {
  try {
    const team = await TeamModel.findOneAndDelete({ id: req.params.id });
    
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
}
