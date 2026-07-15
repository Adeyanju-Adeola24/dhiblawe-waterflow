import { Router } from 'express';
import { queryAll, queryOne, execute } from '../config/database.js';
import { AppError } from '../lib/errors.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const { all } = req.query;
  const sql = all ? 'SELECT * FROM plate_numbers ORDER BY plate' : 'SELECT * FROM plate_numbers WHERE is_active = 1 ORDER BY plate';
  res.json(queryAll(sql));
});

router.get('/:id', auth, (req, res) => {
  const p = queryOne('SELECT * FROM plate_numbers WHERE id = ?', [req.params.id]);
  if (!p) throw new AppError(404, 'Plate not found');
  res.json(p);
});

router.post('/', auth, requireRole('super_admin'), (req, res) => {
  const { plate, default_rate } = req.body;
  if (!plate) throw new AppError(400, 'Plate number required');
  try {
    execute('INSERT INTO plate_numbers (plate, default_rate) VALUES (?,?)', [plate.toUpperCase(), default_rate || 0]);
    const id = queryOne('SELECT last_insert_rowid() as id').id;
    res.status(201).json(queryOne('SELECT * FROM plate_numbers WHERE id = ?', [id]));
  } catch { throw new AppError(409, 'Plate number already exists'); }
});

router.put('/:id', auth, requireRole('super_admin'), (req, res) => {
  const p = queryOne('SELECT * FROM plate_numbers WHERE id = ?', [req.params.id]);
  if (!p) throw new AppError(404, 'Plate not found');
  const { plate, default_rate, is_active } = req.body;
  execute('UPDATE plate_numbers SET plate=?, default_rate=?, is_active=?, updated_at=datetime(\'now\') WHERE id=?',
    [plate ? plate.toUpperCase() : p.plate, default_rate !== undefined ? default_rate : p.default_rate,
     is_active !== undefined ? (is_active ? 1 : 0) : p.is_active, req.params.id]);
  res.json(queryOne('SELECT * FROM plate_numbers WHERE id = ?', [req.params.id]));
});

router.delete('/:id', auth, requireRole('super_admin'), (req, res) => {
  const p = queryOne('SELECT * FROM plate_numbers WHERE id = ?', [req.params.id]);
  if (!p) throw new AppError(404, 'Plate not found');
  execute('DELETE FROM plate_numbers WHERE id = ?', [req.params.id]);
  res.json({ message: 'Plate deleted' });
});

export default router;
