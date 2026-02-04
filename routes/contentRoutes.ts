import { Router, Request, Response } from 'express';
import { createContent, getAllContent, getContentBySection, updateContent, deleteContent, getAdedata } from '../controllers/contentController';
import ContentModel from '../models/Content';

const router = Router();

// GET donation form configuration from Mongo
router.get('/donationform', async (req: Request, res: Response) => {
    try {
        const doc = await ContentModel.findOne({ key: 'donationForm' });
        if (!doc) {
            return res.status(200).json({ fields: [], version: 1 });
        }
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Content-Type', 'application/json');
        res.json(doc.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load donation form configuration' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        await createContent(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create content' });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        // Return adedata by default for backward compatibility with frontend
        await getAdedata(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// Full site snapshot: Mongo if present, else JSON fallback
router.get('/adedata', async (req: Request, res: Response) => {
    try {
        await getAdedata(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch adedata' });
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
