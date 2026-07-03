Primary action element. Six variants: `primary` (purple fill), `secondary` (gray fill), `outline` (border only), `ghost` (no border), `destructive` (red fill), `link` (text underline).

```jsx
<Button>Submit Load</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline" size="sm">Export CSV</Button>
<Button variant="ghost" size="icon">…</Button>
<Button variant="destructive">Delete</Button>
<Button loading>Processing…</Button>
```

Notable variants/props:
- `size="icon"` — square, 36×36px, use with a single Lucide icon child
- `loading` — replaces children with a spinner; disables click
- `disabled` — 50% opacity, no pointer events
- Never place two `primary` buttons side by side; pair with `secondary` or `outline`
