import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import contentRoutes from './routes/contentRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/content', contentRoutes);

// Health check and static file check endpoints
app.get('/api/check-json', (req: Request, res: Response) => {
  const dataPath = path.join(__dirname, 'json', 'adedata.json');
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      res.json({ exists: true, length: raw.length, preview: raw.slice(0, 200) });
    } else {
      res.status(404).json({ exists: false, message: 'adedata.json not found', path: dataPath });
    }
  } catch (err) {
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
