"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/api/content', contentRoutes_1.default);
// Health check and static file check endpoints
app.get('/api/check-json', (req, res) => {
    const dataPath = path_1.default.join(__dirname, 'json', 'adedata.json');
    try {
        if (fs_1.default.existsSync(dataPath)) {
            const raw = fs_1.default.readFileSync(dataPath, 'utf-8');
            res.json({ exists: true, length: raw.length, preview: raw.slice(0, 200) });
        }
        else {
            res.status(404).json({ exists: false, message: 'adedata.json not found', path: dataPath });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Error reading adedata.json', details: err });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Startup complete');
});
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});
