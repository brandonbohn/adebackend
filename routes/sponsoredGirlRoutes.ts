import { Router } from 'express';
import { createSponsoredGirl, getAllSponsoredGirls, getSponsorsForGirl } from '../controllers/sponsoredGirlController';

const router = Router();

router.get('/', getAllSponsoredGirls);
router.post('/', createSponsoredGirl);
router.get('/:girlId/sponsors', getSponsorsForGirl);

export default router;
