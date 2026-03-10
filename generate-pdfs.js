import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.pdf': 'application/pdf',
};

// Simple static file server serving from project root + public as asset root
const server = createServer(async (req, res) => {
  let filePath = decodeURIComponent(req.url.split('?')[0]);
  // Try public/ first for /assets/ paths, then root
  let fullPath = resolve(__dirname, 'public' + filePath);
  try {
    const data = await readFile(fullPath);
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    // Try root
    fullPath = resolve(__dirname, filePath.slice(1));
    try {
      const data = await readFile(fullPath);
      res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

await new Promise(r => server.listen(0, r));
const port = server.address().port;
console.log('Server on port ' + port);

const flyers = [
  { id: 'basisscholen', name: 'Dodgeball School - Basisscholen' },
  { id: 'middelbare-scholen', name: 'Dodgeball School - Middelbare Scholen' },
  { id: 'bso', name: 'Dodgeball School - BSO' },
  { id: 'gemeente-buurtsport', name: 'Dodgeball School - Gemeente & Buurtsport' },
  { id: 'sportdagen-evenementen', name: 'Dodgeball School - Sportdagen & Evenementen' },
];

const browser = await chromium.launch();

for (const flyer of flyers) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/flyers.html?flyer=${flyer.id}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: resolve(__dirname, 'public/flyers/' + flyer.id + '.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  console.log('Generated: ' + flyer.name + '.pdf');
  await page.close();
}

await browser.close();
server.close();
console.log('Done! All PDFs in public/flyers/');
