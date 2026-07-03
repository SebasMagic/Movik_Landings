/**
 * Badge — Compact status indicator. Dot-based (preferred) or pill variant.
 * Use dot-based for table rows and detail pages; pill for cards and summaries.
 */
export function Badge({ status, variant = 'dot', label, style }) {
  const statusMap = {
    funded:    { color: '#16A34A', bg: 'rgba(22,163,74,0.10)',    label: label || 'Funded' },
    approved:  { color: '#16A34A', bg: 'rgba(22,163,74,0.10)',    label: label || 'Approved' },
    pending:   { color: '#D97706', bg: 'rgba(217,119,6,0.10)',    label: label || 'Pending' },
    'in-review': { color: '#8236FC', bg: 'rgba(130,54,252,0.10)', label: label || 'In Review' },
    rejected:  { color: '#E33D3D', bg: 'rgba(227,61,61,0.10)',    label: label || 'Rejected' },
    draft:     { color: '#6B6B76', bg: 'rgba(107,107,118,0.10)', label: label || 'Draft' },
  };

  const s = statusMap[status] || { color: '#6B6B76', bg: 'rgba(107,107,118,0.10)', label: label || status };

  if (variant === 'dot') {
    return React.createElement('span', {
      style: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans)',
        color: 'var(--foreground)', ...style,
      }
    },
      React.createElement('span', { style: { width: '7px', height: '7px', borderRadius: '50%', background: s.color, flexShrink: 0 } }),
      s.label
    );
  }

  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 8px', borderRadius: '9999px',
      fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans)',
      color: s.color, background: s.bg, ...style,
    }
  }, s.label);
}
