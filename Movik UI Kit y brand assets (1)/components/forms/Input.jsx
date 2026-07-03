/**
 * Input — Text input field with label, helper text, and error state.
 * Renders a full form field group: label + input + optional helper/error.
 */
export function Input({ id, label, placeholder, value, onChange, type = 'text', error, helper, disabled = false, style }) {
  const [focused, setFocused] = React.useState(false);

  const inputStyle = {
    width: '100%', height: '36px', padding: '0 12px',
    fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400,
    color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
    background: disabled ? 'var(--muted)' : 'var(--background)',
    border: `1px solid ${error ? 'var(--destructive)' : focused ? 'var(--primary)' : 'var(--input)'}`,
    borderRadius: 'var(--radius-input)',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)' : 'none',
    transition: 'var(--transition-colors)',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', ...style } },
    label && React.createElement('label', {
      htmlFor: id,
      style: { fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)' }
    }, label),
    React.createElement('input', {
      id, type, placeholder, value, onChange, disabled,
      style: inputStyle,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    }),
    (helper || error) && React.createElement('span', {
      style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: error ? 'var(--destructive)' : 'var(--muted-foreground)' }
    }, error || helper)
  );
}

/**
 * Textarea — Multi-line input with label support.
 */
export function Textarea({ id, label, placeholder, value, onChange, rows = 4, error, helper, disabled = false, style }) {
  const [focused, setFocused] = React.useState(false);

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', ...style } },
    label && React.createElement('label', {
      htmlFor: id,
      style: { fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)' }
    }, label),
    React.createElement('textarea', {
      id, placeholder, value, onChange, disabled, rows,
      style: {
        width: '100%', padding: '8px 12px',
        fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400,
        color: 'var(--foreground)', background: disabled ? 'var(--muted)' : 'var(--background)',
        border: `1px solid ${error ? 'var(--destructive)' : focused ? 'var(--primary)' : 'var(--input)'}`,
        borderRadius: 'var(--radius-input)', outline: 'none', resize: 'vertical',
        boxShadow: focused ? '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)' : 'none',
        transition: 'var(--transition-colors)',
      },
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    }),
    (helper || error) && React.createElement('span', {
      style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: error ? 'var(--destructive)' : 'var(--muted-foreground)' }
    }, error || helper)
  );
}

/**
 * Switch — Toggle control with label.
 */
export function Switch({ id, label, description, checked = false, onChange, disabled = false }) {
  const [on, setOn] = React.useState(checked);

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    setOn(next);
    onChange && onChange(next);
  };

  return React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: disabled ? 'not-allowed' : 'pointer' }, onClick: toggle },
    React.createElement('div', {
      role: 'switch', 'aria-checked': on,
      style: {
        width: '40px', height: '22px', borderRadius: '9999px',
        background: on ? 'var(--primary)' : 'var(--border)',
        position: 'relative', flexShrink: 0,
        transition: 'background 150ms', marginTop: '1px',
        opacity: disabled ? 0.5 : 1,
      }
    },
      React.createElement('span', {
        style: {
          position: 'absolute', top: '3px',
          left: on ? '21px' : '3px',
          width: '16px', height: '16px',
          borderRadius: '50%', background: '#fff',
          transition: 'left 150ms',
        }
      })
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
      label && React.createElement('span', { style: { fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--foreground)' } }, label),
      description && React.createElement('span', { style: { fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--muted-foreground)' } }, description)
    )
  );
}
