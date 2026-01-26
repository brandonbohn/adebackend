import express from 'express';
import { createContact } from '../controllers/contactController';

const router = express.Router();

/**
 * Public Contact Routes
 * Base path: /api/contacts
 */

// Submit contact form
router.post('/', createContact);

export default router;
