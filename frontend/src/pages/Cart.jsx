import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../App';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useContext(CartContext);
  const formatPrice = (price) => `${(price / 100).toLocaleString('ru-RU')} ₽`;

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Корзина</h1>
          <div className="empty-state">
            <h3>Корзина пуста</h3>
            <p>Добавьте товары из <Link to="/catalog" style={{ color: 'var(--color-primary)' }}>каталога</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Корзина ({cartCount} {cartCount === 1 ? 'товар' : 'товаров'})</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          <div>
            {cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                <div style={{ width: '100px', height: '130px', borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-surface-hover)' }}>
                  <img src={item.imageUrl || 'https://via.placeholder.com/100x130'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.productId}`} style={{ fontWeight: 600, fontSize: '1.05rem' }}>{item.name}</Link>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {item.size && <span>Размер: {item.size} </span>}
                    {item.color && <span>Цвет: {item.color}</span>}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => updateQuantity(index, item.quantity - 1)}>−</button>
                    <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                    <button className="btn btn-sm btn-secondary" onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                    <button className="btn btn-sm btn-danger" style={{ marginLeft: 'auto' }} onClick={() => removeFromCart(index)}>Удалить</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'sticky', top: 'calc(var(--header-height) + 1rem)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Итого</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              <span>Товары ({cartCount})</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <span>Всего</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatPrice(cartTotal)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
              Оформить заказ
            </Link>
            <Link to="/catalog" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
