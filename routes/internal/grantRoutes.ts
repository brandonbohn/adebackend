import express from 'express';
import {
  getAllGrants,
  getGrantById,
  createGrant,
  updateGrant,
  deleteGrant
} from '../../controllers/grantController';

const router = express.Router();

router.get('/', getAllGrants);
router.get('/:id', getGrantById);
router.post('/', createGrant);
router.put('/:id', updateGrant);
router.delete('/:id', deleteGrant);

export default router;
