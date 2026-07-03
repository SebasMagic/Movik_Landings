/**
 * Alert — Inline feedback banner. Left-border 2px accent color, icon, title + description.
 * Variants: success, info (primary), warning, error.
 */
export function Alert({ variant = 'info', title, description, style }) {
  const map = {
    success: { color: '#16A34A', bg: 'rgba(22,163,74,0.06)', icon: '✓' },
    info:    { color: '#8236FC', bg: 'rgba(130,54,252,0.06)', icon: 'ℹ' },
    warning: { color: '#D97706', bg: 'rgba(217,119,6,0.06)',  icon: '⚠' },
    error:   { color: '#E33D3D', bg: 'rgba(227,61,61,0.06)',  icon: '✕' },
  };
  const s = map[variant] || map.info;
  return React.createElement('div', {
    style: {
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: 'var(--card)', borderLeft: `2px solid ${s.color}`,
      border: '1px solid var(--border)', borderLeftWidth: '2px', borderLeftColor: s.color,
      ...style,
    }
  },
    React.createElement('span', { style: { color: s.color, fontSize: '14px', fontWeight: 700, marginTop: '1px', flexShrink: 0 } }, s.icon),
    React.createElement('div', null,
      title && React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', margin: 0 } }, title),
      description && React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted-foreground)', margin: title ? '3px 0 0' : 0 } }, description),
    )
  );
}

/**
 * Toast — Light notification chip. Appears at bottom-right; auto-dismisses.
 */
export function Toast({ message, variant = 'success', onDismiss, style }) {
  const iconColor = { success: '#16A34A', error: '#E33D3D', loading: 'var(--primary)' }[variant] || '#16A34A';
  const icon = { success: '✓', error: '✕', loading: '↻' }[variant] || '✓';
  return React.createElement('div', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      padding: '9px 14px', borderRadius: 'var(--radius-md)',
      background: 'var(--card)', border: '1px solid var(--border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--foreground)',
      ...style,
    }
  },
    React.createElement('span', { style: { color: iconColor, fontWeight: 700 } }, icon),
    message,
    onDismiss && React.createElement('button', {
      onClick: onDismiss,
      style: { marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '12px', padding: '0', lineHeight: 1 }
    }, '✕')
  );
}

/**
 * Progress — Thin progress bar with label and percentage.
 */
export function Progress({ label, value = 0, max = 100, style }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct >= 90 ? '#E33D3D' : pct >= 75 ? '#D97706' : 'var(--primary)';
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', ...style } },
    (label || value !== undefined) && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      label && React.createElement('span', { style: { fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' } }, label),
      React.createElement('span', { style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' } }, `${Math.round(pct)}%`)
    ),
    React.createElement('div', { style: { height: '6px', background: 'var(--muted)', borderRadius: '9999px', overflow: 'hidden' } },
      React.createElement('div', { style: { height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 400ms ease' } })
    )
  );
}

/**
 * Skeleton — Animated pulse placeholder for loading states.
 */
export function Skeleton({ width = '100%', height = '16px', radius = 'var(--radius-md)', style }) {
  return React.createElement('div', {
    style: {
      width, height, borderRadius: radius,
      background: 'var(--muted)',
      animation: 'movik-pulse 1.5s ease-in-out infinite',
      ...style,
    }
  });
}
