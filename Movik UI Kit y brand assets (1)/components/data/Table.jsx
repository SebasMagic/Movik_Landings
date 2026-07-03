/**
 * Table — Dense, scannable data table. Monospace amounts, dot-based status, subtle row hover.
 * Pass `columns` and `rows`; each row object keys match column `key` values.
 */
export function Table({ title, subtitle, columns = [], rows = [], onRowClick, actionLabel, onAction, emptyTitle, emptyDescription, emptyActionLabel, onEmptyAction, style }) {
  return React.createElement('div', {
    style: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden', ...style }
  },
    (title || actionLabel) && React.createElement('div', {
      style: { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }
    },
      React.createElement('div', null,
        title && React.createElement('h3', { style: { fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 } }, title),
        subtitle && React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '2px 0 0' } }, subtitle),
      ),
      actionLabel && React.createElement('button', {
        onClick: onAction,
        style: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
      }, actionLabel),
    ),
    rows.length === 0
      ? React.createElement('div', { style: { padding: '48px 20px', textAlign: 'center' } },
          React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 6px' } }, emptyTitle || 'No data'),
          emptyDescription && React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 16px' } }, emptyDescription),
          emptyActionLabel && React.createElement('button', {
            onClick: onEmptyAction,
            style: { padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
          }, emptyActionLabel)
        )
      : React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement('thead', null,
            React.createElement('tr', { style: { borderBottom: '1px solid var(--border)' } },
              columns.map(col => React.createElement('th', {
                key: col.key,
                style: { padding: '10px 20px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }
              }, col.label))
            )
          ),
          React.createElement('tbody', null,
            rows.map((row, i) => React.createElement('tr', {
              key: i,
              onClick: onRowClick ? () => onRowClick(row) : undefined,
              style: { borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 150ms' },
              onMouseEnter: e => { if (onRowClick) e.currentTarget.style.background = 'var(--muted)'; },
              onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; },
            },
              columns.map(col => React.createElement('td', {
                key: col.key,
                style: {
                  padding: '12px 20px',
                  fontFamily: col.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                  fontSize: '13px', color: 'var(--foreground)',
                  fontVariantNumeric: col.tabular ? 'tabular-nums' : undefined,
                }
              }, row[col.key]))
            ))
          )
        )
  );
}
