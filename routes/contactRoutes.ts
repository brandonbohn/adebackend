import express from 'express';
import { createContact, getAllContacts } from '../controllers/contactController';

const router = express.Router();

/**
 * Public Contact Routes
 * Base path: /api/contacts
 */

// Submit contact form
router.post('/', createContact);

// Get all contacts (admin)
router.get('/', getAllContacts);

export default router;
