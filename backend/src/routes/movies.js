import { Router } from 'express';
import { body } from 'express-validator';
import { getDb } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { validate, paginate } from '../middleware/validate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

router.get('/', paginate, (req, res, next) => {
  try {
    const db = getDb();
    const search = req.query.search || '';
    const { limit, offset } = req.pagination;

    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE title LIKE ?';
      params.push(`%${search}%`);
    }

    const total = db.queryOne(`SELECT COUNT(*) as count FROM movies ${where}`, params);
    const movies = db.queryAll(`SELECT * FROM movies ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);

    res.json({
      success: true,
      data: movies,
      pagination: { page: req.pagination.page, limit, total: total.count },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', (req, res, next) => {
  try {
    const db = getDb();
    const movie = db.queryOne('SELECT * FROM movies WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
    if (!movie) throw new AppError('Movie not found', 404);

    const collections = db.queryAll('SELECT * FROM collections WHERE movieId = ?', [movie.id]);
    const products = db.queryAll('SELECT * FROM products WHERE movieId = ? AND isActive = 1', [movie.id]);

    res.json({
      success: true,
      data: { ...movie, collections, products },
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  [body('title').trim().notEmpty().withMessage('Title required'), body('year').optional(), validate],
  (req, res, next) => {
    try {
      const { title, description, posterUrl, year, genre } = req.body;
      const slug = slugify(title);
      const db = getDb();

      const existing = db.queryOne('SELECT id FROM movies WHERE slug = ?', [slug]);
      if (existing) throw new AppError('Movie with this title already exists', 400);

      const result = db.insert('INSERT INTO movies (title, slug, description, posterUrl, year, genre) VALUES (?, ?, ?, ?, ?, ?)', [title, slug, description || '', posterUrl || '', year || '', genre || '']);

      const movie = db.queryOne('SELECT * FROM movies WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json({ success: true, data: movie });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [body('title').optional().trim().notEmpty(), validate],
  (req, res, next) => {
    try {
      const { title, description, posterUrl, year, genre } = req.body;
      const db = getDb();

      const movie = db.queryOne('SELECT * FROM movies WHERE id = ?', [req.params.id]);
      if (!movie) throw new AppError('Movie not found', 404);

      const slug = title ? slugify(title) : movie.slug;
      db.execute("UPDATE movies SET title = ?, slug = ?, description = ?, posterUrl = ?, year = ?, genre = ?, updatedAt = datetime('now') WHERE id = ?", [title || movie.title, slug, description ?? movie.description, posterUrl ?? movie.posterUrl, year ?? movie.year, genre ?? movie.genre, req.params.id]);

      const updated = db.queryOne('SELECT * FROM movies WHERE id = ?', [req.params.id]);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();
    const result = db.execute('DELETE FROM movies WHERE id = ?', [req.params.id]);
    if (result.changes === 0) throw new AppError('Movie not found', 404);
    res.json({ success: true, message: 'Movie deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
