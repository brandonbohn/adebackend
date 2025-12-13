import { Router, Request, Response } from 'express';
import { createContent, getAllContent, getContentBySection, updateContent, deleteContent } from '../controllers/contentController';

const router = Router();



router.post('/', async (req: Request, res: Response) => {
    try {
        await createContent(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create content' });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        await getAllContent(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

router.get('/section/:section', async (req: Request, res: Response) => {
    try {
        await getContentBySection(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch section content' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        await updateContent(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update content' });
    }
});
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await deleteContent(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete content' });
    }
});



export default router;
