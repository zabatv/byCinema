import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function MoviePage() {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.movies.get(slug);
        setMovie(res.data);
      } catch (err) {
        console.error('Failed to load movie:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!movie) return <div className="page"><div className="container"><div className="alert alert-error">Фильм не найден</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', alignItems: 'start', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img src={movie.posterUrl || 'https://via.placeholder.com/300x450'} alt={movie.title} referrerPolicy="no-referrer" style={{ width: '100%', height: 'auto' }} />
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{movie.title}</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
              <span>{movie.genre}</span>
              <span>&middot;</span>
              <span>{movie.year}</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>{movie.description}</p>
          </div>
        </div>

        {movie.collections?.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 className="page-title">Коллекции</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {movie.collections.map((col) => (
                <div key={col.id} style={{ backgroundColor: 'var(--color-surface)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{col.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{col.description}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 className="page-title">Товары ({movie.products?.length || 0})</h2>
        {movie.products?.length > 0 ? (
          <div className="grid grid-4">
            {movie.products.map((product) => <ProductCard key={product.id} product={{ ...product, movieTitle: movie.title }} />)}
          </div>
        ) : (
          <div className="empty-state"><h3>Товары для этого фильма пока не добавлены</h3></div>
        )}
      </div>
    </div>
  );
}
