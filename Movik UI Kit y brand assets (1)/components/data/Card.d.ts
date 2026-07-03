export interface CardProps {
  title?: string;
  description?: string;
  /** Content padding override */
  padding?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface StatCardProps {
  /** Metric label, e.g. "Active Loads" */
  label: string;
  /** Formatted value, e.g. "$1.28M" or "42" */
  value: string;
  /** Delta value string, e.g. "+8" or "+12.3%" */
  delta?: string;
  /** Context for delta, e.g. "vs last week" */
  deltaLabel?: string;
  /** true = green delta, false = red delta */
  positive?: boolean;
  style?: React.CSSProperties;
}
