import express from 'express';
import { fetchUrl } from '../../controllers/proxyController';

const router = express.Router();

// Proxy endpoint to fetch external URLs (bypasses CORS)
router.get('/fetch-url', fetchUrl);

export default router;
