import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import contentRoutes from './routes/contentRoutes';

const app = express();
app.use(express.json());

// Enable CORS for only the production frontend domain

interface RailwayTestRequest extends Request {}
interface RailwayTestResponse extends Response {}

app.get(
	"/_railway_test",
	(_: RailwayTestRequest, req: RailwayTestRequest, res: RailwayTestResponse) => {
		res.send("Welcome to the ADEF-C Backend Server");
	}
);
app.use(cors({
  origin: [
    'https://www.adekiberafoundation.org',
    'http://localhost:5173' // allow local dev
  ],
  credentials: true
}));

/* The code snippet `app.get("/_railway_test", (req: Request, res: Response) => {
  res.send("Welcome to the ADEF-C Backend Server");
});` is setting up a route in the Express application. */


app.get("/health", (req: Request, res: Response) => {
  res.send("Server is healthy");
});

app.use('/api/content', contentRoutes);
const PORT = parseInt(process.env.PORT || '8080', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

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

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});
