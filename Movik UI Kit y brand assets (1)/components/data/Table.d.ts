export interface TableColumn {
  key: string;
  label: string;
  /** Render value in monospace font */
  mono?: boolean;
  /** Apply tabular-nums to value */
  tabular?: boolean;
}

export interface TableProps {
  title?: string;
  subtitle?: string;
  columns: TableColumn[];
  rows: Record<string, React.ReactNode>[];
  /** Row click handler — adds hover highlight */
  onRowClick?: (row: Record<string, React.ReactNode>) => void;
  /** Header action button label */
  actionLabel?: string;
  onAction?: () => void;
  /** Empty state */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  style?: React.CSSProperties;
}
