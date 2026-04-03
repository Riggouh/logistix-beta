const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = '/app/data';
const PERSONAL_FILE = path.join(DATA_DIR, 'personal.json');
const SHARED_FILE = path.join(DATA_DIR, 'shared.json');

// ── JSON-Datei laden / speichern ──
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return {}; }
}
function saveJSON(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
  fs.renameSync(tmp, file);
}

// ── Sicherstellen dass data/ existiert ──
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Request-Body lesen ──
function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

// ── Statische Dateien ──
function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ── Server ──
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Storage API ──
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    const action = url.pathname.replace('/api/', '');
    const shared = url.searchParams.get('shared') === '1';
    const file = shared ? SHARED_FILE : PERSONAL_FILE;

    try {
      if (action === 'get') {
        const key = url.searchParams.get('key');
        if (!key) { res.end('null'); return; }
        const db = loadJSON(file);
        if (key in db) {
          res.end(JSON.stringify({ key, value: db[key], shared }));
        } else {
          res.end('null');
        }
      }
      else if (action === 'set') {
        const body = await readBody(req);
        const { key, value } = body;
        if (!key) { res.writeHead(400); res.end('{"error":"key required"}'); return; }
        const db = loadJSON(file);
        db[key] = value;
        saveJSON(file, db);
        res.end(JSON.stringify({ key, value, shared }));
      }
      else if (action === 'delete') {
        const key = url.searchParams.get('key');
        if (!key) { res.end('null'); return; }
        const db = loadJSON(file);
        const existed = key in db;
        delete db[key];
        if (existed) saveJSON(file, db);
        res.end(JSON.stringify({ key, deleted: existed, shared }));
      }
      else if (action === 'list') {
        const prefix = url.searchParams.get('prefix') || '';
        const db = loadJSON(file);
        const keys = Object.keys(db).filter(k => !prefix || k.startsWith(prefix));
        res.end(JSON.stringify({ keys, prefix, shared }));
      }
      else {
        res.writeHead(404);
        res.end('{"error":"unknown action"}');
      }
    } catch (e) {
      res.writeHead(500);
      res.end('{"error":"server error"}');
    }
    return;
  }

  // ── Statische Dateien ──
  let filePath = path.join('/app/public', url.pathname === '/' ? 'index.html' : url.pathname);
  serveStatic(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚛 LogistiX läuft auf Port ${PORT}`);
});
