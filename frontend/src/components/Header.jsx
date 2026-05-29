import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, CartContext } from '../App';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      height: 'var(--header-height)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '100%',
      }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--color-primary)' }}>By</span>Cinema
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/catalog" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--color-text)'}
            onMouseOut={e => e.target.style.color = 'var(--color-text-secondary)'}>
            Каталог
          </Link>
          <Link to="/cart" style={{ position: 'relative', fontSize: '0.9rem', color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'var(--color-text)'}
            onMouseOut={e => e.target.style.color = 'var(--color-text-secondary)'}>
            Корзина
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                backgroundColor: 'var(--color-primary)', color: 'white',
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px',
                borderRadius: '50%', minWidth: '18px', textAlign: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/profile" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}
                onMouseOver={e => e.target.style.color = 'var(--color-text)'}
                onMouseOut={e => e.target.style.color = 'var(--color-text-secondary)'}>
                {user.name}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-sm btn-primary">Админка</Link>
              )}
              <button onClick={logout} className="btn btn-sm btn-secondary">Выйти</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary">Войти</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
