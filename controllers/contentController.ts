import { Request, Response } from 'express';
// import { ContentModel } from '../models/Content';
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
    let section = req.body.section;
    if (typeof section === 'string') section = section.trim();
    const { section: _section, ...sectionData } = req.body;
    const rootKeys = Object.keys(main).filter(k => k !== 'sectionsData');
    const sectionsDataKeys = main.sectionsData ? Object.keys(main.sectionsData) : [];
    console.log('[createContent] Section to update:', section);
    console.log('[createContent] Root-level keys:', rootKeys);
    console.log('[createContent] sectionsData keys:', sectionsDataKeys);
    let updated = false;
    if (section) {
      // Try updating in sectionsData first (case-insensitive)
      const foundSectionDataKey = sectionsDataKeys.find(k => k.toLowerCase() === section.toLowerCase());
      if (main.sectionsData && foundSectionDataKey) {
        main.sectionsData[foundSectionDataKey] = {
          ...main.sectionsData[foundSectionDataKey],
          ...sectionData
        };
        updated = true;
      } else {
        // Try updating root-level section (case-insensitive)
        const foundRootKey = rootKeys.find(k => k.toLowerCase() === section.toLowerCase());
        if (foundRootKey) {
          // If the root key is an object, merge; otherwise, replace
          if (typeof main[foundRootKey] === 'object' && !Array.isArray(main[foundRootKey]) && main[foundRootKey] !== null) {
            main[foundRootKey] = {
              ...main[foundRootKey],
              ...sectionData
            };
          } else {
            // For arrays, primitives, or if you want to fully replace, use req.body.value or req.body itself
            main[foundRootKey] = req.body.value !== undefined ? req.body.value : req.body;
          }
          updated = true;
        }
      }
    }
    if (updated) {
      try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[createContent] Successfully wrote to adedata.json. Updated section '${section}':`, JSON.stringify(main[section] || (main.sectionsData && main.sectionsData[section]), null, 2));
        res.status(201).json({ message: 'Content updated', data: main[section] || (main.sectionsData && main.sectionsData[section]) });
      } catch (writeErr) {
        console.error('[createContent] Failed to write adedata.json:', writeErr);
        res.status(500).json({ error: 'Failed to write adedata.json', details: writeErr, path: dataPath });
      }
    } else {
      const availableSections = [...sectionsDataKeys, ...rootKeys];
      console.error('[createContent] Section not found in JSON:', section, 'Available sections:', availableSections);
      res.status(400).json({ error: 'Section not found in JSON', section, availableSections });
    }
  } catch (error) {
    console.error('[createContent] General error:', error, 'Request body:', req.body);
    res.status(500).json({ error: 'Failed to create content', details: error });
  }
}


export async function getAllContent(req: Request, res: Response): Promise<void> {
  try {
    const dataPath = path.join(__dirname, '../json/adedata.json');
    if (!fs.existsSync(dataPath)) {
      res.status(500).json({ error: 'adedata.json not found', path: dataPath });
      return;
    }
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data[0] || !data[0].sectionsData) {
        res.status(500).json({ error: 'adedata.json format error', data });
        return;
      }
      res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content', details: error });
  }
}


export async function getContentBySection(req: Request, res: Response): Promise<void> {
  try {
    const dataPath = path.join(__dirname, '../json/adedata.json');
    if (!fs.existsSync(dataPath)) {
      res.status(500).json({ error: 'adedata.json not found', path: dataPath });
      return;
    }
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data[0] || !data[0].sectionsData) {
      res.status(500).json({ error: 'adedata.json format error', data });
      return;
    }
    const section = req.params.section;
    const sectionData = data[0].sectionsData[section];
    if (!sectionData) {
      res.status(404).json({ error: 'Section not found', section });
      return;
    }
    res.json(sectionData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content', details: error });
  }
}

export async function updateContent(req: Request, res: Response): Promise<void> {
  // Not implemented: file-based update by id
  res.status(501).json({ error: 'Update by id not implemented in file-based backend.' });
}

export async function deleteContent(req: Request, res: Response): Promise<void> {
  // Not implemented: file-based delete by id
  res.status(501).json({ error: 'Delete by id not implemented in file-based backend.' });
}
