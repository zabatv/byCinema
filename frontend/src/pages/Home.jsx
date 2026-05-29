import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [moviesRes, productsRes] = await Promise.all([
          api.movies.list({ limit: 6 }),
          api.products.list({ limit: 8, sort: 'createdAt' }),
        ]);
        setMovies(moviesRes.data || []);
        setFeaturedProducts(productsRes.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div>
      <section style={{
        padding: '4rem 0',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #1a0a0a 100%)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>
            Одежда из твоих<br />
            <span style={{ color: 'var(--color-primary)' }}>любимых фильмов</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Футболки, худи, куртки и аксессуары, вдохновлённые культовыми кинолентами
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/catalog" className="btn btn-primary">Смотреть каталог</Link>
            <Link to="/catalog" className="btn btn-secondary">Все товары</Link>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container">
          <h2 className="page-title">Фильмы</h2>
          {movies.length === 0 ? (
            <div className="empty-state"><h3>Фильмы пока не добавлены</h3></div>
          ) : (
            <div className="grid grid-3">
              {movies.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.slug}`} className="card" style={{ textDecoration: 'none' }}>
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', backgroundColor: 'var(--color-surface-hover)' }}>
                    <img
                      src={movie.posterUrl || 'https://via.placeholder.com/400x225?text=No+Poster'}
                      alt={movie.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{movie.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {movie.genre} &middot; {movie.year}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <h2 className="page-title" style={{ marginTop: '3rem' }}>Новинки</h2>
          {featuredProducts.length === 0 ? (
            <div className="empty-state"><h3>Товары пока не добавлены</h3></div>
          ) : (
            <div className="grid grid-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
