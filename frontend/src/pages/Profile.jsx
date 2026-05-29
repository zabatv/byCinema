import { useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { api } from '../api/client';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    api.orders.list().then((res) => setOrders(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const formatPrice = (price) => `${(price / 100).toLocaleString('ru-RU')} ₽`;

  const handleUpdate = async () => {
    try {
      await api.auth.updateProfile({ name });
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Личный кабинет</h1>

        {location.state?.orderCreated && (
          <div className="alert alert-success">Заказ успешно оформлен!</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Профиль</h3>
            {editing ? (
              <div>
                <div className="form-group">
                  <label>Имя</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-primary" onClick={handleUpdate}>Сохранить</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div>
                <p><strong>{user.name}</strong></p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <span className="badge badge-primary">{user.role}</span>
                </p>
                <button className="btn btn-sm btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setEditing(true)}>
                  Редактировать
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>Мои заказы</h3>
            {loading ? (
              <div className="spinner" />
            ) : orders.length === 0 ? (
              <div className="empty-state"><h3>У вас пока нет заказов</h3></div>
            ) : (
              orders.map((order) => (
                <div key={order.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Заказ #{order.id}</span>
                    <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}`}>
                      {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'shipped' ? 'Отправлен' : order.status === 'delivered' ? 'Доставлен' : order.status === 'cancelled' ? 'Отменён' : order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <span>Итого</span>
                    <span style={{ color: 'var(--color-primary)' }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
