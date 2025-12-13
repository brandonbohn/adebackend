"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contentController_1 = require("../controllers/contentController");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        await (0, contentController_1.createContent)(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create content' });
    }
});
router.get('/', async (req, res) => {
    try {
        await (0, contentController_1.getAllContent)(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
router.get('/section/:section', async (req, res) => {
    try {
        await (0, contentController_1.getContentBySection)(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch section content' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        await (0, contentController_1.updateContent)(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update content' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        await (0, contentController_1.deleteContent)(req, res);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete content' });
    }
});
exports.default = router;
