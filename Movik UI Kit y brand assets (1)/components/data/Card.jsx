/**
 * Card — Gray surface container. No shadow; 1px border; 8px radius.
 * Variants: default (general content), stat (metric + delta), feature (icon + action).
 */
export function Card({ title, description, children, padding = '20px', style }) {
  return React.createElement('div', {
    style: {
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)', padding, ...style,
    }
  },
    (title || description) && React.createElement('div', { style: { marginBottom: children ? '12px' : 0 } },
      title && React.createElement('h3', { style: { fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 } }, title),
      description && React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '4px 0 0' } }, description),
    ),
    children
  );
}

/**
 * StatCard — Metric card with value, label, and optional delta indicator.
 */
export function StatCard({ label, value, delta, deltaLabel, positive, style }) {
  return React.createElement('div', {
    style: {
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)', padding: '20px', ...style,
    }
  },
    React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)', margin: '0 0 8px' } }, label),
    React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 6px', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' } }, value),
    delta && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      React.createElement('span', { style: { fontSize: '12px', fontWeight: 600, color: positive !== false ? '#16A34A' : '#E33D3D', fontFamily: 'var(--font-sans)' } }, delta),
      deltaLabel && React.createElement('span', { style: { fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' } }, deltaLabel),
    )
  );
}
