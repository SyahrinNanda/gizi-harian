const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_FILE = path.join(__dirname, '..', 'data.json');
// Load .env file manually
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
}

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const SECRET_TOKEN = process.env.SECRET_TOKEN; // Simple token for auth

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Routes ---

  // 1. Login Endpoint
  if (req.url === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        if (username === ADMIN_USER && password === ADMIN_PASS) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token: SECRET_TOKEN }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Username atau password salah' }));
        }
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
    return;
  }

  // 2. Read Data Endpoint
  if (req.url === '/api/data' && req.method === 'GET') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Failed to read data' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  // 3. Save Data Endpoint (Protected)
  if (req.url === '/api/data' && req.method === 'POST') {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        // Validate JSON
        JSON.parse(body);
        fs.writeFile(DATA_FILE, body, 'utf8', (err) => {
          if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, message: 'Gagal menyimpan file' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Data berhasil disimpan!' }));
        });
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Format JSON tidak valid' }));
      }
    });
    return;
  }

  // 4. Image Upload Endpoint (Protected)
  if (req.url === '/api/upload' && req.method === 'POST') {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
      return;
    }

    let body = '';
    // Increase limit for image uploads by collecting all chunks properly
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.name || !payload.base64) {
          throw new Error('Invalid payload');
        }

        // Extract base64 data
        const base64Data = payload.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate safe unique filename
        const safeName = payload.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = Date.now() + '-' + safeName;
        const uploadDir = path.join(__dirname, '..', 'image');

        // Create directory if not exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);

        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, message: 'Gagal menyimpan gambar' }));
            return;
          }

          // Delete old image if provided
          if (payload.old_url && typeof payload.old_url === 'string' && payload.old_url.startsWith('assets/image/')) {
            // Path to old file: __dirname is assets/js, so we go up two levels to root, then append assets/image/...
            const oldFilePath = path.join(__dirname, '..', '..', payload.old_url);
            if (fs.existsSync(oldFilePath)) {
              try {
                fs.unlinkSync(oldFilePath);
              } catch (e) {
                console.error("Gagal menghapus file lama:", e);
              }
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, url: `assets/image/${fileName}` }));
        });
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Format upload tidak valid' }));
      }
    });
    return;
  }

  // --- Static File Server ---
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // Prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const absPath = path.join(__dirname, '..', '..', filePath);

  fs.stat(absPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    const ext = path.extname(absPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(absPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Admin Server berjalan di: http://localhost:${PORT}`);
  console.log(` Halaman Admin: http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});
