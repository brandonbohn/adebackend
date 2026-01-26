import express from 'express';
import { 
  getAllDonors
} from '../controllers/donorController';
import {
  getAllVolunteers as getAdminVolunteers
} from '../controllers/volunteerController';
import {
  getAllContacts
} from '../controllers/contactController';

const router = express.Router();

/**
 * Admin Routes
 * Base path: /api/admin
 * TODO: Add authentication middleware to protect these routes
 */

// Donor management
router.get('/donors', getAllDonors);              // Get all donors (full data)

// Volunteer management
router.get('/volunteers', getAdminVolunteers);      // Get all volunteers (full data)

// Contact/Inquiry management
router.get('/contacts', getAllContacts);            // Get all contacts

export default router;
