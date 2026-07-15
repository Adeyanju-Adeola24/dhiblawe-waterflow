import { Router } from 'express';
import { queryAll, queryOne, execute } from '../config/database.js';
import { AppError } from '../lib/errors.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const { all } = req.query;
  const sql = all ? 'SELECT * FROM clients ORDER BY name' : 'SELECT * FROM clients WHERE is_active = 1 ORDER BY name';
  res.json(queryAll(sql));
});

router.get('/:id', auth, (req, res) => {
  const c = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!c) throw new AppError(404, 'Client not found');
  res.json(c);
});

router.post('/', auth, requireRole('super_admin', 'data_entry'), (req, res) => {
  const { name, address } = req.body;
  if (!name) throw new AppError(400, 'Client name required');
  execute('INSERT INTO clients (name, address) VALUES (?,?)', [name, address || null]);
  const id = queryOne('SELECT last_insert_rowid() as id').id;
  res.status(201).json(queryOne('SELECT * FROM clients WHERE id = ?', [id]));
});

router.put('/:id', auth, requireRole('super_admin'), (req, res) => {
  const c = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!c) throw new AppError(404, 'Client not found');
  const { name, address, is_active } = req.body;
  execute('UPDATE clients SET name=?, address=?, is_active=?, updated_at=datetime(\'now\') WHERE id=?',
    [name || c.name, address !== undefined ? address : c.address, is_active !== undefined ? (is_active ? 1 : 0) : c.is_active, req.params.id]);
  res.json(queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]));
});

router.delete('/:id', auth, requireRole('super_admin'), (req, res) => {
  const c = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!c) throw new AppError(404, 'Client not found');
  execute('DELETE FROM clients WHERE id = ?', [req.params.id]);
  res.json({ message: 'Client deleted' });
});

export default router;
