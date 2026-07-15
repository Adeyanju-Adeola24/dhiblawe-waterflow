import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { save, initDb } from '../config/database.js';
import { AppError } from '../lib/errors.js';
import { auth, requireRole } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'dhiblawe.db');

const router = Router();
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

router.post('/backup', auth, requireRole('super_admin'), (req, res) => {
  save();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${ts}.db`;
  fs.copyFileSync(DB_PATH, path.join(BACKUPS_DIR, filename));
  res.json({ message: 'Backup created', filename });
});

router.get('/backups', auth, requireRole('super_admin'), (req, res) => {
  const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.db')).map(f => {
    const stat = fs.statSync(path.join(BACKUPS_DIR, f));
    return { filename: f, size: stat.size, created: stat.mtime };
  }).sort((a, b) => new Date(b.created) - new Date(a.created));
  res.json(files);
});

router.post('/restore', auth, requireRole('super_admin'), async (req, res) => {
  const { filename } = req.body;
  if (!filename) throw new AppError(400, 'Filename required');
  const src = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(src)) throw new AppError(404, 'Backup not found');
  fs.copyFileSync(src, DB_PATH);
  await initDb();
  res.json({ message: 'Database restored' });
});

export default router;
