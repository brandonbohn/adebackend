import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ResourceModel from '../models/resource';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resources');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, PowerPoint, images, text files, and ZIP files are allowed.'));
    }
  }
});

// Upload middleware
export const uploadResourceFile = upload.single('file');

// Upload resource
export async function uploadResource(req: Request, res: Response): Promise<void> {
  try {
    const { category = 'other', title, description } = req.body;
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    
    // Generate resource ID
    const count = await ResourceModel.countDocuments();
    const resourceId = `RES${String(count + 1).padStart(3, '0')}`;
    
    // Create resource record
    const resource = await ResourceModel.create({
      id: resourceId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category,
      title,
      description,
      uploadedAt: new Date().toISOString()
    });
    
    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading resource', error: error.message });
  }
}

// Get all resources
export async function getResources(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.query;
    
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    
    const resources = await ResourceModel.find(filter).sort({ uploadedAt: -1 });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
}

// Get specific resource by ID
export async function getResourceById(req: Request, res: Response): Promise<void> {
  try {
    const { resourceId } = req.params;
    
    const resource = await ResourceModel.findOne({ id: resourceId });
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    res.json(resource);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching resource', error: error.message });
  }
}

// Download resource
export async function downloadResource(req: Request, res: Response): Promise<void> {
  try {
    const { resourceId } = req.params;
    
    const resource = await ResourceModel.findOne({ id: resourceId });
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    if (!fs.existsSync(resource.filePath)) {
      res.status(404).json({ message: 'File not found on disk' });
      return;
    }
    
    res.download(resource.filePath, resource.originalName);
  } catch (error: any) {
    res.status(500).json({ message: 'Error downloading resource', error: error.message });
  }
}

// Delete resource
export async function deleteResource(req: Request, res: Response): Promise<void> {
  try {
    const { resourceId } = req.params;
    
    const resource = await ResourceModel.findOne({ id: resourceId });
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    // Delete file from disk
    if (fs.existsSync(resource.filePath)) {
      fs.unlinkSync(resource.filePath);
    }
    
    // Delete resource record
    await ResourceModel.findOneAndDelete({ id: resourceId });
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
}
