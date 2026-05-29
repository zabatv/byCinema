import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
import { getDb } from '../config/database.js';
import { JWT_SECRET } from '../config/env.js';

export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.queryOne('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return next(new AppError('User not found', 401));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.queryOne('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.id]);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}
