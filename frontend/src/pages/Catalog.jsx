import { useState, useEffect } from 'react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.products.list({ ...filters, page: pagination.page, limit: pagination.limit });
        setProducts(res.data || []);
        setPagination((prev) => ({ ...prev, total: res.pagination?.total || 0 }));
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters, pagination.page]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Каталог товаров</h1>
        <Filters filters={filters} onChange={setFilters} types={['Футболка','Худи','Куртка','Кепка','Свитер','Штаны','Аксессуар']} sizes={['XS','S','M','L','XL','XXL']} colors={['Чёрный','Белый','Синий','Красный','Зелёный','Серый','Тёмно-синий','Хаки']} />
        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state"><h3>Товары не найдены</h3><p>Попробуйте изменить параметры поиска</p></div>
        ) : (
          <>
            <div className="grid grid-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
