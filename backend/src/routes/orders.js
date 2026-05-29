import { Router } from 'express';
import { body } from 'express-validator';
import { getDb } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.size').optional().isString(),
    body('items.*.color').optional().isString(),
    body('shippingAddress').isObject().withMessage('Shipping address required'),
    validate,
  ],
  (req, res, next) => {
    try {
      const { items, shippingAddress } = req.body;
      const db = getDb();

      const orderItems = [];
      let total = 0;

      for (const item of items) {
        const product = db.queryOne('SELECT * FROM products WHERE id = ? AND isActive = 1', [item.productId]);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
        if (product.stock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        orderItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
          imageUrl: product.imageUrl,
        });

        db.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, product.id]);
      }

      const result = db.insert('INSERT INTO orders (userId, items, total, status, shippingAddress) VALUES (?, ?, ?, ?, ?)', [req.user.id, JSON.stringify(orderItems), total, 'pending', JSON.stringify(shippingAddress)]);

      const order = db.queryOne('SELECT * FROM orders WHERE id = ?', [result.lastInsertRowid]);
      order.items = JSON.parse(order.items);
      order.shippingAddress = JSON.parse(order.shippingAddress);

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    const orders = db.queryAll('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.user.id])
      .map((o) => ({
        ...o,
        items: JSON.parse(o.items),
        shippingAddress: JSON.parse(o.shippingAddress),
      }));

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, (req, res, next) => {
  try {
    const db = getDb();
    const order = db.queryOne('SELECT * FROM orders WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (!order) throw new AppError('Order not found', 404);

    order.items = JSON.parse(order.items);
    order.shippingAddress = JSON.parse(order.shippingAddress);

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

export default router;
