import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('workshop.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS advisors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    plate_number TEXT,
    car_model TEXT,
    service_type TEXT,
    estimated_completion TEXT,
    status INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert or update default advisor based on environment variables
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'iridium123';

const checkAdvisor = db.prepare('SELECT * FROM advisors WHERE username = ?').get(adminUsername);
if (!checkAdvisor) {
  db.prepare('INSERT INTO advisors (username, password) VALUES (?, ?)').run(adminUsername, adminPassword);
} else {
  // Ensure password is updated to match environment variable
  db.prepare('UPDATE advisors SET password = ? WHERE username = ?').run(adminPassword, adminUsername);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple auth middleware (for demo purposes, we'll just use a header or simple token)
  // In a real app, use JWT or sessions.
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer admin-token') {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // API Routes
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const advisor = db.prepare('SELECT * FROM advisors WHERE username = ? AND password = ?').get(username, password);
    if (advisor) {
      res.json({ token: 'admin-token' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/jobs', requireAuth, (_req, res) => {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
    res.json(jobs);
  });

  app.post('/api/jobs', requireAuth, (req, res) => {
    const { plate_number, car_model, service_type, estimated_completion } = req.body;
    const id = randomUUID();
    db.prepare(`
      INSERT INTO jobs (id, plate_number, car_model, service_type, estimated_completion)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, plate_number, car_model, service_type, estimated_completion);
    
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json(job);
  });

  app.put('/api/jobs/:id/status', requireAuth, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json(job);
  });

  app.put('/api/jobs/:id/eta', requireAuth, (req, res) => {
    const { estimated_completion } = req.body;
    const { id } = req.params;
    db.prepare('UPDATE jobs SET estimated_completion = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(estimated_completion, id);
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json(job);
  });

  app.put('/api/jobs/:id', requireAuth, (req, res) => {
    const { plate_number, car_model, service_type } = req.body;
    const { id } = req.params;
    
    const updates = [];
    const values = [];
    
    if (plate_number !== undefined) {
      updates.push('plate_number = ?');
      values.push(plate_number);
    }
    if (car_model !== undefined) {
      updates.push('car_model = ?');
      values.push(car_model);
    }
    if (service_type !== undefined) {
      updates.push('service_type = ?');
      values.push(service_type);
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...values);
    }
    
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json(job);
  });

  app.delete('/api/jobs/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    res.json({ success: true });
  });

  app.delete('/api/jobs', requireAuth, (_req, res) => {
    db.prepare('DELETE FROM jobs').run();
    res.json({ success: true });
  });

  app.get('/api/track/:id', (req, res) => {
    const { id } = req.params;
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist'), { acceptRanges: false }));
    app.get('*', (req, res) => {
      // Prevent serving index.html for missing static assets
      // This fixes the issue where missing images return 200 OK (index.html) instead of 404
      if (req.path.match(/\.(png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot|ico|json|map)$/)) {
        res.status(404).send('Not found');
        return;
      }
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
