import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import GrantFileModel from '../models/grantFile';
import GrantModel from '../models/grant';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const grantId = req.params.grantId || req.body.grantId;
    const uploadDir = path.join(__dirname, '../uploads/grants', grantId);
    
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
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'));
    }
  }
});

// Upload middleware
export const uploadGrantFile = upload.single('file');

// Upload file for a grant
export async function uploadGrantDocument(req: Request, res: Response): Promise<void> {
  try {
    const { grantId } = req.params;
    const { fileType = 'other', description } = req.body;
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    // Check if grant exists
    const grant = await GrantModel.findOne({ id: grantId });
    if (!grant) {
      res.status(404).json({ message: 'Grant not found' });
      return;
    }
    
    // Generate file ID
    const count = await GrantFileModel.countDocuments();
    const fileId = `GF${String(count + 1).padStart(3, '0')}`;
    
    // Create file record
    const grantFile = await GrantFileModel.create({
      id: fileId,
      grantId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileType,
      description,
      uploadedAt: new Date().toISOString()
    });
    
    // Update grant with file reference
    if (!grant.fileIds) {
      grant.fileIds = [];
    }
    grant.fileIds.push(fileId);
    await grant.save();
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: grantFile
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
}

// Get all files for a grant
export async function getGrantFiles(req: Request, res: Response): Promise<void> {
  try {
    const { grantId } = req.params;
    
    const files = await GrantFileModel.find({ grantId }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
}

// Get specific file by ID
export async function getGrantFileById(req: Request, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    
    const file = await GrantFileModel.findOne({ id: fileId });
    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }
    
    res.json(file);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching file', error: error.message });
  }
}

// Download file
export async function downloadGrantFile(req: Request, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    
    const file = await GrantFileModel.findOne({ id: fileId });
    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }
    
    if (!fs.existsSync(file.filePath)) {
      res.status(404).json({ message: 'File not found on disk' });
      return;
    }
    
    res.download(file.filePath, file.originalName);
  } catch (error: any) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
}

// Delete file
export async function deleteGrantFile(req: Request, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    
    const file = await GrantFileModel.findOne({ id: fileId });
    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }
    
    // Delete file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }
    
    // Remove file reference from grant
    const grant = await GrantModel.findOne({ id: file.grantId });
    if (grant && grant.fileIds) {
      grant.fileIds = grant.fileIds.filter(id => id !== fileId);
      await grant.save();
    }
    
    // Delete file record
    await GrantFileModel.findOneAndDelete({ id: fileId });
    
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
}
