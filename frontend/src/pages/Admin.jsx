import { useState, useEffect, useContext } from 'react';
import { Navigate, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { api } from '../api/client';

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats().then((res) => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!stats) return <div className="alert alert-error">Не удалось загрузить статистику</div>;

  return (
    <div>
      <h2 className="page-title">Панель управления</h2>
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Товары', value: stats.stats.totalProducts, color: 'var(--color-primary)' },
          { label: 'Заказы', value: stats.stats.totalOrders, color: 'var(--color-success)' },
          { label: 'Пользователи', value: stats.stats.totalUsers, color: 'var(--color-warning)' },
          { label: 'Выручка', value: `${(stats.stats.revenue / 100).toLocaleString('ru-RU')} ₽`, color: 'var(--color-primary)' },
        ].map((item) => (
          <div key={item.label} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Последние заказы</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['ID', 'Клиент', 'Сумма', 'Статус', 'Дата'].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem 1rem' }}>#{order.id}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{order.userName || `User #${order.userId}`}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{(order.total / 100).toLocaleString('ru-RU')} ₽</td>
                <td style={{ padding: '0.75rem 1rem' }}><span className={`badge badge-${order.status === 'delivered' ? 'success' : 'warning'}`}>{order.status}</span></td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', type: '', stock: '', description: '', imageUrl: '', movieId: '', collectionId: '' });

  const load = () => {
    setLoading(true);
    api.products.list({ limit: 100 }).then((res) => setProducts(res.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.products.update(editing, { ...form, price: parseInt(form.price) * 100, stock: parseInt(form.stock) || 0 });
      } else {
        await api.products.create({ ...form, price: parseInt(form.price) * 100, stock: parseInt(form.stock) || 0 });
      }
      setEditing(null);
      setForm({ name: '', price: '', type: '', stock: '', description: '', imageUrl: '', movieId: '', collectionId: '' });
      load();
    } catch (err) { alert(err.message); }
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, price: String(p.price / 100), type: p.type, stock: String(p.stock), description: p.description, imageUrl: p.imageUrl, movieId: String(p.movieId || ''), collectionId: String(p.collectionId || '') });
  };

  const remove = async (id) => {
    if (!confirm('Удалить товар?')) return;
    await api.products.delete(id);
    load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="page-title">Управление товарами</h2>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}><label>Название</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
        <div className="form-group" style={{ marginBottom: 0 }}><label>Цена (₽)</label><input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required /></div>
        <div className="form-group" style={{ marginBottom: 0 }}><label>Тип</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}><option value="">Выберите</option><option>Футболка</option><option>Худи</option><option>Куртка</option><option>Кепка</option><option>Свитер</option><option>Штаны</option><option>Аксессуар</option></select></div>
        <div className="form-group" style={{ marginBottom: 0 }}><label>Остаток</label><input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} /></div>
        <div style={{ gridColumn: '1 / -1' }} className="form-group"><label>Описание</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
        <div style={{ gridColumn: '1 / -1' }} className="form-group"><label>URL изображения</label><input value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} /></div>
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="btn btn-primary">{editing ? 'Обновить' : 'Создать'}</button>
          {editing && <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => { setEditing(null); setForm({ name: '', price: '', type: '', stock: '', description: '', imageUrl: '', movieId: '', collectionId: '' }); }}>Отмена</button>}
        </div>
      </form>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>ID</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Название</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Цена</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Тип</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Остаток</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem 1rem' }}>{p.id}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{(p.price / 100).toLocaleString('ru-RU')} ₽</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.type}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.stock}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button className="btn btn-sm btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => edit(p)}>Ред.</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(p.id)}>Удал.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.admin.orders({ limit: 100 }).then((res) => setOrders(res.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.admin.updateOrderStatus(id, status);
    load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="page-title">Заказы</h2>
      {orders.map((order) => (
        <div key={order.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>#{order.id}</strong> — {order.userName || order.userEmail || `User #${order.userId}`}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge badge-${order.status === 'delivered' ? 'success' : 'warning'}`}>{order.status}</span>
              <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} style={{ padding: '0.25rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            {new Date(order.createdAt).toLocaleString('ru-RU')} — {(order.total / 100).toLocaleString('ru-RU')} ₽
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/admin" className="btn btn-sm btn-secondary" end>Статистика</Link>
          <Link to="/admin/products" className="btn btn-sm btn-secondary">Товары</Link>
          <Link to="/admin/orders" className="btn btn-sm btn-secondary">Заказы</Link>
        </div>
        <Routes>
          <Route index element={<AdminStats />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Routes>
      </div>
    </div>
  );
}
