export interface AlertProps {
  variant?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  description?: string;
  style?: React.CSSProperties;
}

export interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'loading';
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

export interface ProgressProps {
  label?: string;
  /** Current value */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  style?: React.CSSProperties;
}

export interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  style?: React.CSSProperties;
}
