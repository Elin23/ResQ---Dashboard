import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { ReactNode } from 'react';

// Shared table contracts stay separate from the rendering implementation.
export interface DataTableQueryState {
  pageIndex: number;
  pageSize: number;
  search: string;
  sorting: SortingState;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: Array<ColumnDef<TData, unknown>>;
  getRowId?: (row: TData, index: number) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  enableSearch?: boolean;
  enableRowSelection?: boolean;
  rowActions?: (row: TData) => ReactNode;
  onRowClick?: (row: TData) => void;
  rowAriaLabel?: (row: TData) => string;
  onSelectionChange?: (rows: TData[]) => void;
  selectionActions?: (rows: TData[]) => ReactNode;
  emptyState?: ReactNode;
  pageCount?: number;
  totalCount?: number;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  manualSorting?: boolean;
  state?: Partial<DataTableQueryState>;
  onStateChange?: (state: DataTableQueryState) => void;
  pageSizeOptions?: number[];
}
