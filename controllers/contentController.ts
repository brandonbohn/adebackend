import { Request, Response } from 'express';
import ContentModel from '../models/Content';
import mongoose from 'mongoose';

export async function createContent(req: Request, res: Response): Promise<void> {
  try {
    const { key, data, section } = req.body;
    const k = key || section; // support old 'section' name
    if (!k || data === undefined) {
      res.status(400).json({ error: 'Missing key/section or data' });
      return;
    }
    const updated = await ContentModel.findOneAndUpdate(
      { key: k },
      { data, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Content upserted', content: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save content', details: error });
  }
}


export async function getAllContent(req: Request, res: Response): Promise<void> {
  try {
    const docs = await ContentModel.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content', details: error });
  }
}


export async function getContentBySection(req: Request, res: Response): Promise<void> {
  try {
    const section = req.params.section;
    const doc = await ContentModel.findOne({ key: section });
    if (!doc) {
      res.status(404).json({ error: 'Section not found', section });
      return;
    }
    res.json(doc.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content', details: error });
  }
}

// New: Return full adedata snapshot from Mongo if present; fallback to JSON file
export async function getAdedata(req: Request, res: Response): Promise<void> {
  try {
    // Try Mongo 'site' collection first
    const coll = mongoose.connection.collection('site');
    const doc = await coll.findOne({}, { sort: { insertedAt: -1 } });
    if (doc && doc.data) {
      return res.json(Array.isArray(doc.data) ? doc.data[0] : doc.data);
    }
  } catch (e) {
    // Ignore and fallback to file
  }

  // Fallback: read from JSON file
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dataPath = path.join(__dirname, '../json/adedata.json');
    if (!fs.existsSync(dataPath)) {
      res.status(404).json({ error: 'adedata.json not found', path: dataPath });
      return;
    }
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw || '[]');
    return res.json(Array.isArray(data) ? data[0] : data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read adedata.json', details: error });
  }
}

export async function updateContent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const updated = await ContentModel.findByIdAndUpdate(
      id,
      { data, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content', details: error });
  }
}

export async function deleteContent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await ContentModel.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content', details: error });
  }
}
