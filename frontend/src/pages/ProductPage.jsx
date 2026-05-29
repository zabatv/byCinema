import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CartContext } from '../App';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.products.get(slug);
        setProduct(res.data);
        if (res.data.sizes?.length) setSelectedSize(res.data.sizes[0]);
        if (res.data.colors?.length) setSelectedColor(res.data.colors[0]);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (price) => `${(price / 100).toLocaleString('ru-RU')} ₽`;

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!product) return <div className="page"><div className="container"><div className="alert alert-error">Товар не найден</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          <Link to="/">Главная</Link> / <Link to="/catalog">Каталог</Link> / <span>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
              <img
                src={product.imageUrl || 'https://via.placeholder.com/600x800?text=No+Image'}
                alt={product.name}
                style={{ width: '100%', height: 'auto', aspectRatio: '3/4', objectFit: 'cover' }}
              />
            </div>
          </div>

          <div>
            {product.movieTitle && (
              <Link to={`/movie/${product.movieSlug}`} style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.movieTitle}
              </Link>
            )}
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{product.name}</h1>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>
              {formatPrice(product.price)}
            </p>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {product.type && (
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-primary">{product.type}</span>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="form-group">
                <label>Размер</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`btn btn-sm ${selectedSize === s ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedSize(s)}
                      style={{ minWidth: '48px' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="form-group">
                <label>Цвет</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      className={`btn btn-sm ${selectedColor === c ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedColor(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Количество</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                <button className="btn btn-sm btn-secondary" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleAdd} style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '1rem' }}>
              {added ? '✓ Добавлено!' : 'Добавить в корзину'}
            </button>

            {product.stock <= 5 && product.stock > 0 && (
              <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Осталось всего {product.stock} шт.
              </p>
            )}
          </div>
        </div>

        {product.related?.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <h2 className="page-title">Похожие товары</h2>
            <div className="grid grid-4">
              {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
