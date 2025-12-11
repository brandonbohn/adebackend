require('dotenv').config();
import express, { Request, Response } from 'express';
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running');
});

// ...existing code...

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
