import { Request, Response } from 'express';
import ExpenseModel from '../models/expense';

export async function getAllExpenses(req: Request, res: Response): Promise<void> {
  try {
    const expenses = await ExpenseModel.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
}

export async function getExpenseById(req: Request, res: Response): Promise<void> {
  try {
    const expense = await ExpenseModel.findOne({ id: req.params.id });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  try {
    const { id, programId, programName, description, amount, category, date, receipt, approvedBy } = req.body;

    if (!id || !programId || !programName || !description || !amount || !category || !date || !receipt || !approvedBy) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existing = await ExpenseModel.findOne({ id });
    if (existing) {
      res.status(400).json({ message: 'Expense with this ID already exists' });
      return;
    }

    const newExpense = await ExpenseModel.create({
      id,
      programId,
      programName,
      description,
      amount,
      category,
      date,
      receipt,
      approvedBy,
      status: req.body.status || 'pending',
      vendor: req.body.vendor,
      receiptNumber: req.body.receiptNumber,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    });

    res.status(201).json(newExpense);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
}

export async function updateExpense(req: Request, res: Response): Promise<void> {
  try {
    const expense = await ExpenseModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
}

export async function deleteExpense(req: Request, res: Response): Promise<void> {
  try {
    const expense = await ExpenseModel.findOneAndDelete({ id: req.params.id });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
}
