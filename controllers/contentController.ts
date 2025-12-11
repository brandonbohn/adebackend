import { Request, Response } from 'express';
import { ContentModel } from '../models/Content';
import fs from 'fs';
import path from 'path';

export async function createContent(req: Request, res: Response): Promise<void> {
  try {
    const dataPath = path.join(__dirname, '../json/adedata.json');
    console.log('[createContent] Data path:', dataPath);
    console.log('[createContent] Received payload:', JSON.stringify(req.body, null, 2));
    if (!fs.existsSync(dataPath)) {
      console.error('adedata.json not found at', dataPath);
      res.status(500).json({ error: 'adedata.json not found', path: dataPath });
      return;
    }
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data[0] || !data[0].sectionsData) {
      console.error('adedata.json format error:', data);
      res.status(500).json({ error: 'adedata.json format error', data });
      return;
    }
    const main = data[0];
    const section = req.body.section;
    console.log('[createContent] Section to update:', section);
    if (section && main.sectionsData[section]) {
      main.sectionsData[section] = {
        ...main.sectionsData[section],
        ...req.body
      };
      try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[createContent] Successfully wrote to adedata.json. Updated section '${section}':`, JSON.stringify(main.sectionsData[section], null, 2));
        // Optionally log the full updated JSON (comment out if file is large)
        // console.log('[createContent] Full updated adedata.json:', JSON.stringify(data, null, 2));
        res.status(201).json({ message: 'Content updated', data: main.sectionsData[section] });
      } catch (writeErr) {
        console.error('[createContent] Failed to write adedata.json:', writeErr);
        res.status(500).json({ error: 'Failed to write adedata.json', details: writeErr, path: dataPath });
      }
    } else {
      console.error('[createContent] Section not found in JSON:', section, 'Available sections:', Object.keys(main.sectionsData));
      res.status(400).json({ error: 'Section not found in JSON', section, availableSections: Object.keys(main.sectionsData) });
    }
  } catch (error) {
    console.error('[createContent] General error:', error, 'Request body:', req.body);
    res.status(500).json({ error: 'Failed to create content', details: error });
  }
}

export async function getAllContent(req: Request, res: Response): Promise<void> {
  try {
    const contents = await ContentModel.find();
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function getContentBySection(req: Request, res: Response): Promise<void> {
  try {
    const contents = await ContentModel.find({ section: req.params.section });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
}

export async function updateContent(req: Request, res: Response): Promise<void> {
  try {
    const updated = await ContentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content' });
  }
}

export async function deleteContent(req: Request, res: Response): Promise<void> {
  try {
    await ContentModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
}
