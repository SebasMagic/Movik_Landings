/**
 * Button — Primary interactive element. Six variants, three sizes, icon support.
 * Use `primary` for the main CTA on any page or card. Never place two primary buttons side-by-side.
 *
 * @example
 * <Button>Submit Load</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button variant="ghost" size="icon">⋯</Button>
 * <Button disabled loading>Processing…</Button>
 */
export function Button({ variant = 'primary', size = 'default', disabled = false, loading = false, children, onClick, type = 'button', style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', fontFamily: 'var(--font-sans)', fontWeight: 600,
    border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--radius-button)', transition: 'var(--transition-colors)',
    outline: 'none', textDecoration: 'none', whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
  };

  const sizes = {
    sm:      { padding: '6px 12px', fontSize: '12px', height: '32px' },
    default: { padding: '8px 16px', fontSize: '14px', height: '36px' },
    lg:      { padding: '10px 24px', fontSize: '16px', height: '44px' },
    icon:    { padding: '0', fontSize: '14px', width: '36px', height: '36px' },
  };

  const variants = {
    primary:     { background: 'var(--primary)', color: '#fff', border: 'none' },
    secondary:   { background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' },
    outline:     { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' },
    ghost:       { background: 'transparent', color: 'var(--foreground)', border: 'none' },
    destructive: { background: 'var(--destructive)', color: '#fff', border: 'none' },
    link:        { background: 'transparent', color: 'var(--primary)', border: 'none', textDecoration: 'underline', height: 'auto', padding: '0' },
  };

  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const hoverOverrides = hovered && !disabled && !loading ? {
    primary:     { background: 'oklch(0.43 0.27 286)' },
    secondary:   { background: 'var(--muted)' },
    outline:     { background: 'var(--muted)' },
    ghost:       { background: 'var(--muted)' },
    destructive: { background: 'oklch(0.48 0.22 25)' },
    link:        {},
  }[variant] : {};

  const focusStyle = focused ? { boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)' } : {};

  const Spinner = () => React.createElement('span', {
    style: {
      width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: 'currentColor', borderRadius: '50%',
      display: 'inline-block',
      animation: 'movik-spin 0.7s linear infinite',
    }
  });

  return React.createElement('button', {
    type, disabled: disabled || loading,
    onClick,
    style: { ...base, ...sizes[size] || sizes.default, ...variants[variant] || variants.primary, ...hoverOverrides, ...focusStyle, ...style },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  },
    loading ? React.createElement(Spinner) : null,
    children
  );
}
