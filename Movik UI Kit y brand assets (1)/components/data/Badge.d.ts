export interface BadgeProps {
  /** Status key — drives color and default label */
  status: 'funded' | 'approved' | 'pending' | 'in-review' | 'rejected' | 'draft';
  /** Dot (inline text with colored dot) or pill (rounded background chip) */
  variant?: 'dot' | 'pill';
  /** Override the default status label */
  label?: string;
  style?: React.CSSProperties;
}
