import express from 'express';
import {
  getDonorSystemContent,
  getDonorSystemSection,
  updateDonorSystemContent,
  updateDonorSystemSection
} from '../controllers/donorSystemContentController';

const router = express.Router();

// Get all content
router.get('/', getDonorSystemContent);

// Get specific section
router.get('/:section', getDonorSystemSection);

// Update all content (admin only)
router.put('/', updateDonorSystemContent);

// Update specific section (admin only)
router.put('/:section', updateDonorSystemSection);

export default router;
