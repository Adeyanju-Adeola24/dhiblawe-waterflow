import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export function auth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) throw new AppError(401, 'Authentication required');
  try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); next(); }
  catch { throw new AppError(401, 'Invalid or expired token'); }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw new AppError(403, 'Insufficient permissions');
    next();
  };
}
