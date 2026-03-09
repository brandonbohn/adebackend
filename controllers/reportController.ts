import { Request, Response } from 'express';
import ReportModel from '../models/report';

export async function getAllReports(req: Request, res: Response): Promise<void> {
  try {
    const reports = await ReportModel.find().sort({ generatedDate: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
}

export async function getReportById(req: Request, res: Response): Promise<void> {
  try {
    const report = await ReportModel.findOne({ id: req.params.id });
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
}

export async function createReport(req: Request, res: Response): Promise<void> {
  try {
    const { id, title, type, period, summary, totalBudget, totalSpent, programsCount, beneficiariesReached } = req.body;

    if (!id || !title || !type || !period || !summary || totalBudget === undefined || totalSpent === undefined || !programsCount || !beneficiariesReached) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existing = await ReportModel.findOne({ id });
    if (existing) {
      res.status(400).json({ message: 'Report with this ID already exists' });
      return;
    }

    const newReport = await ReportModel.create({
      id,
      title,
      type,
      period,
      generatedDate: new Date().toISOString().split('T')[0],
      summary,
      totalBudget,
      totalSpent,
      programsCount,
      beneficiariesReached
    });

    res.status(201).json(newReport);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
}

export async function updateReport(req: Request, res: Response): Promise<void> {
  try {
    const report = await ReportModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
}

export async function deleteReport(req: Request, res: Response): Promise<void> {
  try {
    const report = await ReportModel.findOneAndDelete({ id: req.params.id });
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
}
