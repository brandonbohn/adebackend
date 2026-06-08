import express from 'express';
import {
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
  deleteResource
} from '../../controllers/resourceController';

const router = express.Router();

// Upload a resource
router.post('/resources', uploadResource);

// Get all resources
router.get('/resources', getResources);

// Get specific resource by ID
router.get('/resources/:resourceId', getResourceById);

// Download a resource
router.get('/resources/:resourceId/download', downloadResource);

// Delete a resource
router.delete('/resources/:resourceId', deleteResource);

export default router;
