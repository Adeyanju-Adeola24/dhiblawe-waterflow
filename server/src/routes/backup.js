import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { queryAll } from '../config/database.js';

const router = Router();

router.post('/backup', auth, requireRole('super_admin'), async (req, res) => {
  const backup = {};
  const tables = ['users', 'clients', 'plate_numbers', 'trips', 'payments', 'deposits', 'settings'];
  for (const t of tables) {
    backup[t] = await queryAll(`SELECT * FROM ${t}`);
  }
  res.json({ message: 'Backup captured', timestamp: new Date().toISOString(), data: backup });
});

router.get('/backups', auth, requireRole('super_admin'), async (req, res) => {
  res.json([{ id: 1, filename: 'manual-backup', size: 'N/A (Google Sheets)', created_at: new Date().toISOString() }]);
});

router.post('/restore', auth, requireRole('super_admin'), (req, res) => {
  res.json({ message: 'Google Sheets data is auto-persisted. Use the Google Sheet directly to restore data.' });
});

export default router;
