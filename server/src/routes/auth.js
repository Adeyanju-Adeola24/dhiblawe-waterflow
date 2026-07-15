import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { queryOne, execute, queryAll } from '../config/database.js';
import { AppError } from '../lib/errors.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError(400, 'Email and password required');
  const user = queryOne('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!user) throw new AppError(401, 'Invalid credentials');
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new AppError(401, 'Invalid credentials');
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

router.get('/me', auth, (req, res) => {
  const user = queryOne('SELECT id, username, email, role, is_active FROM users WHERE id = ?', [req.user.id]);
  if (!user) throw new AppError(404, 'User not found');
  res.json(user);
});

router.get('/users', auth, requireRole('super_admin'), (req, res) => {
  const users = queryAll('SELECT id, username, email, role, is_active, created_at FROM users ORDER BY username');
  res.json(users);
});

router.get('/users/:id', auth, requireRole('super_admin'), (req, res) => {
  const user = queryOne('SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?', [req.params.id]);
  if (!user) throw new AppError(404, 'User not found');
  res.json(user);
});

router.post('/users', auth, requireRole('super_admin'), async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) throw new AppError(400, 'Username, email, and password required');
  const hash = await bcrypt.hash(password, 10);
  try {
    execute('INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)', [username, email, hash, role || 'data_entry']);
    res.status(201).json({ message: 'User created' });
  } catch { throw new AppError(409, 'Username or email already exists'); }
});

router.put('/users/:id', auth, requireRole('super_admin'), async (req, res) => {
  const { username, email, role, is_active, password } = req.body;
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) throw new AppError(404, 'User not found');
  let sql = 'UPDATE users SET username=?, email=?, role=?, is_active=?, updated_at=datetime(\'now\')';
  let params = [username || user.username, email || user.email, role || user.role, is_active !== undefined ? is_active : user.is_active];
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    sql += ', password_hash=?';
    params.push(hash);
  }
  sql += ' WHERE id=?';
  params.push(req.params.id);
  execute(sql, params);
  res.json({ message: 'User updated' });
});

router.delete('/users/:id', auth, requireRole('super_admin'), (req, res) => {
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) throw new AppError(404, 'User not found');
  execute('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

export default router;
