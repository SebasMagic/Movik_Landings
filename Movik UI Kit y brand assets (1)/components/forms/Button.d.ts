import { ButtonProps } from './Button';

/**
 * @startingPoint section="Forms" subtitle="Button — 6 variants, 3 sizes" viewport="700x200"
 */
export interface ButtonProps {
  /** Visual style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  /** Size preset */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /** Disabled state — reduces opacity, blocks pointer events */
  disabled?: boolean;
  /** Loading state — shows spinner, blocks click */
  loading?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Extra inline styles */
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
