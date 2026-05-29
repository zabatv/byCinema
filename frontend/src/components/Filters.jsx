export default function Filters({ filters, onChange, types, sizes, colors }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'end',
      marginBottom: '2rem',
    }}>
      <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
        <label>Поиск</label>
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
        <label>Тип</label>
        <select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)}>
          <option value="">Все</option>
          {(types || []).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
        <label>Размер</label>
        <select value={filters.size || ''} onChange={(e) => handleChange('size', e.target.value)}>
          <option value="">Все</option>
          {(sizes || []).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
        <label>Цвет</label>
        <select value={filters.color || ''} onChange={(e) => handleChange('color', e.target.value)}>
          <option value="">Все</option>
          {(colors || []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
        <label>Сортировка</label>
        <select value={filters.sort || ''} onChange={(e) => handleChange('sort', e.target.value)}>
          <option value="">Новые</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
          <option value="name">По имени</option>
        </select>
      </div>
    </div>
  );
}
