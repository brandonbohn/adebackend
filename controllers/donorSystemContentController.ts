import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const contentPath = path.join(__dirname, '../json/donorSystemContent.json');

// Get all donor system content
export async function getDonorSystemContent(req: Request, res: Response): Promise<void> {
  try {
    if (!fs.existsSync(contentPath)) {
      res.status(404).json({ message: 'Donor system content not found' });
      return;
    }

    const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ message: 'Error reading donor system content', error: error.message });
  }
}

// Get specific section of content
export async function getDonorSystemSection(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params;

    if (!fs.existsSync(contentPath)) {
      res.status(404).json({ message: 'Donor system content not found' });
      return;
    }

    const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    if (!content[section]) {
      res.status(404).json({ message: `Section '${section}' not found` });
      return;
    }

    res.json(content[section]);
  } catch (error: any) {
    res.status(500).json({ message: 'Error reading donor system content', error: error.message });
  }
}

// Update donor system content (admin only)
export async function updateDonorSystemContent(req: Request, res: Response): Promise<void> {
  try {
    const updatedContent = req.body;

    fs.writeFileSync(contentPath, JSON.stringify(updatedContent, null, 2), 'utf-8');

    res.json({ message: 'Content updated successfully', content: updatedContent });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating donor system content', error: error.message });
  }
}

// Update specific section of content
export async function updateDonorSystemSection(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params;
    const updatedSection = req.body;

    if (!fs.existsSync(contentPath)) {
      res.status(404).json({ message: 'Donor system content not found' });
      return;
    }

    const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    if (!content[section]) {
      res.status(404).json({ message: `Section '${section}' not found` });
      return;
    }

    content[section] = updatedSection;

    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf-8');

    res.json({ message: `Section '${section}' updated successfully`, section: content[section] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating donor system content', error: error.message });
  }
}

// Delete budget category
export async function deleteBudgetCategory(req: Request, res: Response): Promise<void> {
  try {
    const { categoryId } = req.params;

    if (!fs.existsSync(contentPath)) {
      res.status(404).json({ message: 'Donor system content not found' });
      return;
    }

    const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    if (!content.budgets || !content.budgets.categories) {
      res.status(404).json({ message: 'Budget categories not found' });
      return;
    }

    const categoryIndex = content.budgets.categories.findIndex((cat: any) => cat.id === categoryId);
    if (categoryIndex === -1) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    content.budgets.categories.splice(categoryIndex, 1);

    // Also remove from field options if present
    if (content.budgets.fields) {
      const categoryField = content.budgets.fields.find((field: any) => field.name === 'category');
      if (categoryField && categoryField.options) {
        const categoryName = content.budgets.categories[categoryIndex]?.name || categoryId;
        categoryField.options = categoryField.options.filter((opt: string) => opt !== categoryName);
      }
    }

    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf-8');

    res.json({ message: 'Category deleted successfully', categories: content.budgets.categories });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting budget category', error: error.message });
  }
}
