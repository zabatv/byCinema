import { Router } from 'express';
import { getDb } from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', (req, res, next) => {
  try {
    const db = getDb();

    const totalProducts = db.queryOne('SELECT COUNT(*) as count FROM products').count;
    const totalOrders = db.queryOne('SELECT COUNT(*) as count FROM orders').count;
    const totalUsers = db.queryOne('SELECT COUNT(*) as count FROM users').count;
    const totalMovies = db.queryOne('SELECT COUNT(*) as count FROM movies').count;

    const revenue = db.queryOne("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'").total;

    const recentOrders = db.queryAll('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5')
      .map((o) => ({
        ...o,
        items: JSON.parse(o.items),
        shippingAddress: JSON.parse(o.shippingAddress),
      }));

    const ordersByStatus = db.queryAll('SELECT status, COUNT(*) as count FROM orders GROUP BY status');

    res.json({
      success: true,
      data: {
        stats: { totalProducts, totalOrders, totalUsers, totalMovies, revenue },
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', (req, res, next) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let where = '';
    let params = [];
    if (status) {
      where = 'WHERE o.status = ?';
      params.push(status);
    }

    const total = db.queryOne(`SELECT COUNT(*) as count FROM orders o ${where}`, params);
    const orders = db.queryAll(
      `SELECT o.*, u.email as userEmail, u.name as userName 
       FROM orders o LEFT JOIN users u ON o.userId = u.id ${where} 
       ORDER BY o.createdAt DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ).map((o) => ({
      ...o,
      items: JSON.parse(o.items),
      shippingAddress: JSON.parse(o.shippingAddress),
    }));

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total: total.count },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/orders/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const db = getDb();
    const result = db.execute("UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?", [status, req.params.id]);
    if (result.changes === 0) return res.status(404).json({ success: false, error: 'Order not found' });

    const order = db.queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    order.items = JSON.parse(order.items);
    order.shippingAddress = JSON.parse(order.shippingAddress);

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

router.get('/users', (req, res, next) => {
  try {
    const db = getDb();
    const users = db.queryAll('SELECT id, email, name, role, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

export default router;
