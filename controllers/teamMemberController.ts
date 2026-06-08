import { Request, Response } from 'express';
import TeamMemberModel from '../models/teamMember';

export async function getAllTeamMembers(req: Request, res: Response): Promise<void> {
  try {
    const members = await TeamMemberModel.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
}

export async function getTeamMemberById(req: Request, res: Response): Promise<void> {
  try {
    const member = await TeamMemberModel.findOne({ id: req.params.id });
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team member', error: error.message });
  }
}

export async function createTeamMember(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, roleType, roleTitle, startDate, status, phone, email, program, notes } = req.body;
    
    if (!fullName || !roleType || !roleTitle || !startDate || !status || !phone || !email) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const count = await TeamMemberModel.countDocuments();
    const id = `TM${String(count + 1).padStart(3, '0')}`;
    
    const member = await TeamMemberModel.create({
      id,
      fullName,
      roleType,
      roleTitle,
      startDate,
      status,
      phone,
      email,
      program: program || undefined,
      notes: notes || undefined
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating team member', error: error.message });
  }
}

export async function updateTeamMember(req: Request, res: Response): Promise<void> {
  try {
    const member = await TeamMemberModel.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    res.json(member);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating team member', error: error.message });
  }
}

export async function deleteTeamMember(req: Request, res: Response): Promise<void> {
  try {
    const member = await TeamMemberModel.findOneAndDelete({ id: req.params.id });
    
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting team member', error: error.message });
  }
}
