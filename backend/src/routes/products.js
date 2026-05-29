import { Router } from 'express';
import { body } from 'express-validator';
import { getDb } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { validate, paginate } from '../middleware/validate.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';

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
    const { limit, offset } = req.pagination;
    const { search, type, size, color, movieId, collectionId, minPrice, maxPrice, sort } = req.query;

    let conditions = ['p.isActive = 1'];
    let params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      conditions.push('p.type = ?');
      params.push(type);
    }
    if (size) {
      conditions.push("p.sizes LIKE ?");
      params.push(`%"${size}"%`);
    }
    if (color) {
      conditions.push("p.colors LIKE ?");
      params.push(`%"${color}"%`);
    }
    if (movieId) {
      conditions.push('p.movieId = ?');
      params.push(movieId);
    }
    if (collectionId) {
      conditions.push('p.collectionId = ?');
      params.push(collectionId);
    }
    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(parseInt(minPrice));
    }
    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(parseInt(maxPrice));
    }

    let orderBy = 'p.createdAt DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'name') orderBy = 'p.name ASC';

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.queryOne(`SELECT COUNT(*) as count FROM products p ${where}`, params);

    const products = db.queryAll(
      `SELECT p.*, m.title as movieTitle, c.name as collectionName 
       FROM products p 
       LEFT JOIN movies m ON p.movieId = m.id 
       LEFT JOIN collections c ON p.collectionId = c.id 
       ${where} 
       ORDER BY ${orderBy} 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const parsed = products.map((p) => ({
      ...p,
      sizes: JSON.parse(p.sizes || '[]'),
      colors: JSON.parse(p.colors || '[]'),
      gallery: JSON.parse(p.gallery || '[]'),
    }));

    res.json({
      success: true,
      data: parsed,
      pagination: { page: req.pagination.page, limit, total: total.count },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const product = db.queryOne(
      `SELECT p.*, m.title as movieTitle, m.slug as movieSlug, c.name as collectionName 
       FROM products p 
       LEFT JOIN movies m ON p.movieId = m.id 
       LEFT JOIN collections c ON p.collectionId = c.id 
       WHERE p.slug = ? OR p.id = ?`,
      [req.params.slug, req.params.slug],
    );

    if (!product) throw new AppError('Product not found', 404);

    product.sizes = JSON.parse(product.sizes || '[]');
    product.colors = JSON.parse(product.colors || '[]');
    product.gallery = JSON.parse(product.gallery || '[]');

    const related = db.queryAll(
      'SELECT * FROM products WHERE (movieId = ? OR collectionId = ?) AND id != ? AND isActive = 1 LIMIT 4',
      [product.movieId, product.collectionId, product.id],
    ).map((p) => ({
      ...p,
      sizes: JSON.parse(p.sizes || '[]'),
      colors: JSON.parse(p.colors || '[]'),
      gallery: JSON.parse(p.gallery || '[]'),
    }));

    res.json({ success: true, data: { ...product, related } });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('price').isInt({ min: 0 }).withMessage('Valid price required'),
    body('type').optional(),
    validate,
  ],
  (req, res, next) => {
    try {
      const { name, description, price, type, sizes, colors, imageUrl, gallery, collectionId, movieId, stock } = req.body;
      const slug = slugify(name);
      const db = getDb();

      const result = db.insert(
        'INSERT INTO products (name, slug, description, price, type, sizes, colors, imageUrl, gallery, collectionId, movieId, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          name,
          slug,
          description || '',
          price,
          type || '',
          JSON.stringify(sizes || []),
          JSON.stringify(colors || []),
          imageUrl || '',
          JSON.stringify(gallery || []),
          collectionId || null,
          movieId || null,
          stock || 0,
        ],
      );

      const product = db.queryOne('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
      product.sizes = JSON.parse(product.sizes || '[]');
      product.colors = JSON.parse(product.colors || '[]');
      product.gallery = JSON.parse(product.gallery || '[]');

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.put('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();
    const product = db.queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) throw new AppError('Product not found', 404);

    const { name, description, price, type, sizes, colors, imageUrl, gallery, collectionId, movieId, stock, isActive } = req.body;
    const slug = name ? slugify(name) : product.slug;

    db.execute(
      `UPDATE products SET name=?, slug=?, description=?, price=?, type=?, sizes=?, colors=?, imageUrl=?, gallery=?, collectionId=?, movieId=?, stock=?, isActive=?, updatedAt=datetime('now') WHERE id=?`,
      [
        name ?? product.name,
        slug,
        description ?? product.description,
        price ?? product.price,
        type ?? product.type,
        sizes ? JSON.stringify(sizes) : product.sizes,
        colors ? JSON.stringify(colors) : product.colors,
        imageUrl ?? product.imageUrl,
        gallery ? JSON.stringify(gallery) : product.gallery,
        collectionId !== undefined ? collectionId : product.collectionId,
        movieId !== undefined ? movieId : product.movieId,
        stock ?? product.stock,
        isActive ?? product.isActive,
        req.params.id,
      ],
    );

    const updated = db.queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    updated.sizes = JSON.parse(updated.sizes || '[]');
    updated.colors = JSON.parse(updated.colors || '[]');
    updated.gallery = JSON.parse(updated.gallery || '[]');

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();
    const result = db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.changes === 0) throw new AppError('Product not found', 404);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
