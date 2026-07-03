export interface TabItem {
  key: string;
  label: string;
  content?: React.ReactNode;
}
export interface TabsProps {
  items: TabItem[];
  active?: string;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  style?: React.CSSProperties;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange?: (page: number) => void;
  style?: React.CSSProperties;
}
