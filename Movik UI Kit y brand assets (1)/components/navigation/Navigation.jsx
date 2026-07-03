/**
 * Tabs — Horizontal tab bar. Underline indicator on active tab.
 */
export function Tabs({ items = [], active, onChange, style }) {
  const [current, setCurrent] = React.useState(active || (items[0] && items[0].key));
  const select = (key) => { setCurrent(key); onChange && onChange(key); };
  const activeItem = items.find(i => i.key === current);

  return React.createElement('div', { style: { ...style } },
    React.createElement('div', {
      style: { display: 'flex', gap: '0', borderBottom: '1px solid var(--border)' }
    },
      items.map(item => {
        const isActive = item.key === current;
        return React.createElement('button', {
          key: item.key,
          onClick: () => select(item.key),
          style: {
            padding: '8px 16px', background: 'none', border: 'none',
            borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-1px',
            fontFamily: 'var(--font-sans)', fontSize: '14px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
            cursor: 'pointer', transition: 'var(--transition-colors)',
            outline: 'none',
          }
        }, item.label);
      })
    ),
    activeItem && activeItem.content && React.createElement('div', { style: { paddingTop: '16px' } }, activeItem.content)
  );
}

/**
 * Breadcrumbs — Path navigation. Chevron separator. Last item is bold (current page).
 */
export function Breadcrumbs({ items = [], style }) {
  return React.createElement('nav', {
    style: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', ...style }
  },
    items.map((item, i) => {
      const isLast = i === items.length - 1;
      return React.createElement(React.Fragment, { key: i },
        isLast
          ? React.createElement('span', { style: { fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' } }, item.label)
          : React.createElement('a', {
              href: item.href || '#',
              style: { fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'color 150ms' },
              onMouseEnter: e => e.target.style.color = 'var(--foreground)',
              onMouseLeave: e => e.target.style.color = 'var(--muted-foreground)',
            }, item.label),
        !isLast && React.createElement('span', { style: { color: 'var(--muted-foreground)', fontSize: '12px', opacity: 0.5 } }, '›')
      );
    })
  );
}

/**
 * Pagination — Page number controls.
 */
export function Pagination({ currentPage = 1, totalPages = 1, onChange, style }) {
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);
  if (totalPages > 5) { pages.push('…'); pages.push(totalPages); }

  const btnStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'var(--background)',
    color: active ? '#fff' : 'var(--foreground)',
    fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'var(--transition-colors)',
  });

  return React.createElement('div', { style: { display: 'flex', gap: '4px', alignItems: 'center', ...style } },
    pages.map((p, i) =>
      p === '…'
        ? React.createElement('span', { key: i, style: { padding: '0 4px', color: 'var(--muted-foreground)', fontSize: '13px' } }, '…')
        : React.createElement('button', {
            key: p, onClick: () => onChange && onChange(p),
            style: btnStyle(p === currentPage),
          }, p)
    )
  );
}
