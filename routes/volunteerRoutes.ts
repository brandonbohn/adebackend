import express from 'express';
import {
  createVolunteer,
  getAllVolunteers,
  getVolunteerById,
  deleteVolunteer
} from '../controllers/volunteerController';

const router = express.Router();

/**
 * Volunteer Routes
 * Base path: /api/volunteers
 */

// Create new volunteer interest submission
router.post('/', createVolunteer);

// Get all volunteer submissions
router.get('/', getAllVolunteers);

// Get single volunteer by ID
router.get('/:id', getVolunteerById);

// Delete volunteer submission
router.delete('/:id', deleteVolunteer);

export default router;
