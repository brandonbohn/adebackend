import { Request, Response } from 'express';
import BudgetModel from '../models/budget';

export async function getAllBudgets(req: Request, res: Response): Promise<void> {
  try {
    const budgets = await BudgetModel.find().sort({ createdDate: -1 });
    res.json(budgets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
}

export async function getBudgetById(req: Request, res: Response): Promise<void> {
  try {
    const budget = await BudgetModel.findOne({ id: req.params.id });
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }
    res.json(budget);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching budget', error: error.message });
  }
}

export async function createBudget(req: Request, res: Response): Promise<void> {
  try {
    const { name, amount, year, category, description } = req.body;
    
    if (!name || !amount || !year || !category || !description) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Generate a unique ID
    const count = await BudgetModel.countDocuments();
    const id = `B${String(count + 1).padStart(3, '0')}`;

    const budget = await BudgetModel.create({
      id,
      name,
      amount,
      allocated: 0,
      remaining: amount,
      year,
      category,
      description,
      createdDate: new Date().toISOString().split('T')[0]
    });

    res.status(201).json(budget);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating budget', error: error.message });
  }
}

export async function updateBudget(req: Request, res: Response): Promise<void> {
  try {
    const budget = await BudgetModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, remaining: req.body.amount - (req.body.allocated || 0) },
      { new: true, runValidators: true }
    );

    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }

    res.json(budget);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating budget', error: error.message });
  }
}

export async function deleteBudget(req: Request, res: Response): Promise<void> {
  try {
    const budget = await BudgetModel.findOneAndDelete({ id: req.params.id });
    
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting budget', error: error.message });
  }
}
