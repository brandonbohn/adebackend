import { Router } from 'express';
import { createSponsorship, getSponsorships, updateSponsorshipStatus } from '../controllers/sponsorshipController';

const router = Router();

router.get('/', getSponsorships);
router.post('/', createSponsorship);
router.patch('/:id/status', updateSponsorshipStatus);

export default router;
