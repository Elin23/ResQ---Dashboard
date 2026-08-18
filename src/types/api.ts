export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: Record<string, string | number | boolean>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  fieldErrors?: Record<string, string[]>;
  correlationId?: string;
}
