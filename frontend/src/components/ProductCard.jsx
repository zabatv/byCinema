import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../App';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const formatPrice = (price) => `${(price / 100).toLocaleString('ru-RU')} ₽`;

  return (
    <div className="card">
      <Link to={`/product/${product.slug}`}>
        <div style={{
          aspectRatio: '3/4', overflow: 'hidden', backgroundColor: 'var(--color-surface-hover)',
        }}>
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
          />
        </div>
      </Link>
      <div style={{ padding: '1rem' }}>
        {product.movieTitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {product.movieTitle}
          </span>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 style={{ fontSize: '1rem', margin: '0.25rem 0', fontWeight: 600 }}>{product.name}</h3>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {formatPrice(product.price)}
          </span>
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
