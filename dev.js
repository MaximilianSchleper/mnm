// Local dev server: `npm run dev`, then open http://localhost:3000
//
// Serves index.html and runs api/maxes.js the way Vercel does, with no Vercel
// account needed. Without BLOB_READ_WRITE_TOKEN the API is in demo mode
// (fake Maxes, in memory), which is what you want for local work.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from './api/maxes.js';

const PORT = Number(process.env.PORT) || 3000;

// Minimal stand-ins for the res.status() helper Vercel adds.
function withHelpers(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  return res;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/api/maxes') return await handler(req, withHelpers(res));
    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(await readFile(new URL('./index.html', import.meta.url)));
    }
    res.statusCode = 404;
    res.end('Not found');
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Server error');
  }
}).listen(PORT, () => {
  const mode = process.env.BLOB_READ_WRITE_TOKEN ? 'REAL storage (careful!)' : 'demo data';
  console.log(`Max Network Map on http://localhost:${PORT} using ${mode}`);
});
