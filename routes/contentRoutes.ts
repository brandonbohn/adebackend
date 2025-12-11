import { Router } from 'express';
import { createContent, getAllContent, getContentBySection, updateContent, deleteContent } from '../controllers/contentController';

const router = Router();

router.post('/', createContent);
router.get('/', getAllContent);
router.get('/section/:section', getContentBySection);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;
