import { SVGProps } from 'react';

// Common SVG Icon Props
export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// Generic API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Loading state types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, string | number | boolean | string[] | number[]>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// Component base props
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

// Modal/Dialog props
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  closable?: boolean;
}

// Form field props
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
} 