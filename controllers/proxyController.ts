import { Request, Response } from 'express';

export async function fetchUrl(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      res.status(400).json({ message: 'URL is required' });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({ message: 'Invalid URL format' });
      return;
    }

    // Fetch the external URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      res.status(response.status).json({ message: `External URL returned ${response.status}` });
      return;
    }

    const html = await response.text();
    res.send(html);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching URL', error: error.message });
  }
}
