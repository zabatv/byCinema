import { Router } from 'express';
import { body } from 'express-validator';
import { getDb } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { validate } from '../middleware/validate.js';
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

router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const collections = db.queryAll(
      `SELECT c.*, m.title as movieTitle, m.slug as movieSlug,
       (SELECT COUNT(*) FROM products WHERE collectionId = c.id) as productCount
       FROM collections c LEFT JOIN movies m ON c.movieId = m.id
       ORDER BY c.name`,
    );
    res.json({ success: true, data: collections });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', (req, res, next) => {
  try {
    const db = getDb();
    const collection = db.queryOne(
      'SELECT c.*, m.title as movieTitle, m.slug as movieSlug FROM collections c LEFT JOIN movies m ON c.movieId = m.id WHERE c.slug = ? OR c.id = ?',
      [req.params.slug, req.params.slug],
    );

    if (!collection) throw new AppError('Collection not found', 404);

    const products = db.queryAll('SELECT * FROM products WHERE collectionId = ? AND isActive = 1', [collection.id])
      .map(p => ({...p, sizes: JSON.parse(p.sizes || '[]'), colors: JSON.parse(p.colors || '[]'), gallery: JSON.parse(p.gallery || '[]')}));

    res.json({ success: true, data: { ...collection, products } });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('Name required'), body('movieId').optional().isInt(), validate],
  (req, res, next) => {
    try {
      const { name, description, movieId } = req.body;
      const slug = slugify(name);
      const db = getDb();

      const result = db.insert('INSERT INTO collections (name, slug, description, movieId) VALUES (?, ?, ?, ?)', [name, slug, description || '', movieId || null]);

      const collection = db.queryOne('SELECT * FROM collections WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json({ success: true, data: collection });
    } catch (err) {
      next(err);
    }
  },
);

router.put('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();
    const collection = db.queryOne('SELECT * FROM collections WHERE id = ?', [req.params.id]);
    if (!collection) throw new AppError('Collection not found', 404);

    const { name, description, movieId } = req.body;
    db.execute(
      "UPDATE collections SET name=?, slug=?, description=?, movieId=?, updatedAt=datetime('now') WHERE id=?",
      [name || collection.name, name ? slugify(name) : collection.slug, description ?? collection.description, movieId !== undefined ? movieId : collection.movieId, req.params.id],
    );

    const updated = db.queryOne('SELECT * FROM collections WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();
    const result = db.execute('DELETE FROM collections WHERE id = ?', [req.params.id]);
    if (result.changes === 0) throw new AppError('Collection not found', 404);
    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
