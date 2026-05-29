import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, CartContext } from '../App';
import { api } from '../api/client';

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    country: 'Россия',
  });

  const formatPrice = (price) => `${(price / 100).toLocaleString('ru-RU')} ₽`;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      setError('Корзина пуста');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.orders.create({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: address,
      });
      clearCart();
      navigate('/profile', { state: { orderCreated: true } });
    } catch (err) {
      setError(err.message || 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Оформление заказа</h1>
          <div className="empty-state"><h3>Корзина пуста</h3><p>Добавьте товары перед оформлением</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Оформление заказа</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Адрес доставки</h3>
              <div className="form-group">
                <label>ФИО</label>
                <input name="fullName" value={address.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input name="phone" type="tel" value={address.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Улица, дом, квартира</label>
                <input name="street" value={address.street} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Город</label>
                  <input name="city" value={address.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Индекс</label>
                  <input name="zip" value={address.zip} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Страна</label>
                <input name="country" value={address.country} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
                {loading ? 'Оформление...' : `Оплатить ${formatPrice(cartTotal)}`}
              </button>
            </div>
          </form>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Ваш заказ</h3>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                <div>
                  <div>{item.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                    {item.quantity} шт. {item.size && `· ${item.size}`} {item.color && `· ${item.color}`}
                  </div>
                </div>
                <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginTop: '1rem', paddingTop: '1rem' }}>
              <span>Итого</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
