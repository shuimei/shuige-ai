import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Minimal static server for local preview only. It exists to mimic the real
// host's sub-path behaviour, which a file:// preview cannot reproduce.
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT ?? 4173);
const prefix = process.env.BASE_PREFIX ?? '';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const notFound = async (res) => {
  const page = await readFile(join(dist, '404.html')).catch(() => 'Not found');
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(page);
};

const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

    // Mimic a sub-path deployment faithfully: anything outside the prefix must
    // 404 here, otherwise a broken absolute link would look fine locally and
    // only fail once deployed.
    if (prefix) {
      if (pathname !== prefix && !pathname.startsWith(prefix + '/')) {
        await notFound(res);
        return;
      }
      pathname = pathname.slice(prefix.length) || '/';
    }

    // Contain the request inside dist — normalize first, then verify the prefix.
    let target = normalize(join(dist, pathname));
    if (target !== dist && !target.startsWith(dist + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let body;
    try {
      body = await readFile(target);
    } catch {
      // Directory-style URLs fall back to index.html, like GitHub Pages does.
      target = join(target, 'index.html');
      try {
        body = await readFile(target);
      } catch {
        await notFound(res);
        return;
      }
    }

    res.writeHead(200, { 'content-type': types[extname(target)] ?? 'application/octet-stream' }).end(body);
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
});

server.listen(port, () => {
  console.log(`preview: http://localhost:${port}${prefix}/  (serving ${dist})`);
});
