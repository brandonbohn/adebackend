import express from 'express';
import {
  uploadResourceFile,
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
  deleteResource
} from '../../controllers/resourceController';

const router = express.Router();

// Upload a resource
router.post('/', uploadResourceFile, uploadResource);

// Get all resources
router.get('/', getResources);

// Get specific resource by ID
router.get('/:resourceId', getResourceById);

// Download a resource
router.get('/:resourceId/download', downloadResource);

// Delete a resource
router.delete('/:resourceId', deleteResource);

export default router;
