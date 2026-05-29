export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: '2rem 0',
      marginTop: '3rem',
    }}>
      <div className="container" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <span style={{ fontWeight: 800 }}>
            <span style={{ color: 'var(--color-primary)' }}>By</span>Cinema
          </span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginLeft: '1rem' }}>
            Магазин одежды из кино
          </span>
        </div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} ByCinema Merch. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
