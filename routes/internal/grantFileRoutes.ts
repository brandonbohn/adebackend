import express from 'express';
import {
  uploadGrantFile,
  uploadGrantDocument,
  getGrantFiles,
  getGrantFileById,
  downloadGrantFile,
  deleteGrantFile
} from '../../controllers/grantFileController';

const router = express.Router();

// Upload a file for a specific grant
router.post('/:grantId/files', uploadGrantFile, uploadGrantDocument);

// Get all files for a specific grant
router.get('/:grantId/files', getGrantFiles);

// Get specific file by ID
router.get('/files/:fileId', getGrantFileById);

// Download a file
router.get('/files/:fileId/download', downloadGrantFile);

// Delete a file
router.delete('/files/:fileId', deleteGrantFile);

export default router;
