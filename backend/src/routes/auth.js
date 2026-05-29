import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { getDb } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

const router = Router();

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    validate,
  ],
  (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const db = getDb();

      const existing = db.queryOne('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) {
        throw new AppError('Email already registered', 400);
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.insert('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, name, 'user']);

      const user = { id: result.lastInsertRowid, email, name, role: 'user' };
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validate,
  ],
  (req, res, next) => {
    try {
      const { email, password } = req.body;
      const db = getDb();

      const user = db.queryOne('SELECT * FROM users WHERE email = ?', [email]);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = generateToken(user);
      const { password: _, ...userData } = user;

      res.json({
        success: true,
        data: { user: userData, token },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

router.put(
  '/profile',
  authenticate,
  [body('name').optional().trim().notEmpty(), validate],
  (req, res, next) => {
    try {
      const { name } = req.body;
      const db = getDb();
      db.execute("UPDATE users SET name = ?, updatedAt = datetime('now') WHERE id = ?", [name, req.user.id]);
      const user = db.queryOne('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id]);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
