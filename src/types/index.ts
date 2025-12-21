/**
 * Global Type Definitions for Madura Mart
 */

// ==========================================
// USER & AUTHENTICATION TYPES
// ==========================================

export type UserRole = 'owner' | 'admin' | 'cashier';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  outlets?: string[];
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ==========================================
// OUTLET & LOCATION TYPES
// ==========================================

export interface Outlet {
  id: string;
  name: string;
  owner: string;
  address: string;
  phone: string;
  email?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserOutlet {
  id: string;
  userId: string;
  outletId: string;
  permissions?: string[];
  createdAt?: string;
}

// ==========================================
// PRODUCT & INVENTORY TYPES
// ==========================================

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Product {
  id: string;
  outletId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  sku?: string;
  barcode?: string;
  image?: string;
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  description?: string;
  costPrice?: number;
  sku?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// ==========================================
// TRANSACTION & SALES TYPES
// ==========================================

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'other';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'refunded';

export interface TransactionItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  outletId: string;
  cashierId: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  tax?: number;
  total: number;
  notes?: string;
  receiptNumber?: string;
  status?: TransactionStatus;
  items?: TransactionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionData {
  outletId: string;
  cashierId: string;
  paymentMethod: PaymentMethod;
  items: TransactionItem[];
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  tax?: number;
  total: number;
  notes?: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// CONTEXT STATE TYPES
// ==========================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register?: (userData: Partial<User>) => Promise<void>;
}

export interface OutletContextType {
  currentOutlet: Outlet | null;
  userOutlets: Outlet[];
  loading: boolean;
  error: string | null;
  selectOutlet: (outletId: string) => void;
  getOutlets: () => Promise<Outlet[]>;
}

// ==========================================
// FORM STATE TYPES
// ==========================================

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export interface FormHandlers<T = Record<string, any>> {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFieldError: (field: string, message: string) => void;
  resetForm: () => void;
}

// ==========================================
// COMPONENT PROPS TYPES
// ==========================================

export interface AlertModalProps {
  isOpen: boolean;
  type: 'info' | 'success' | 'error' | 'warning' | 'confirmation';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  onClose?: () => void;
}

export interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isSelected?: boolean;
}

// ==========================================
// COMMON TYPES
// ==========================================

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
  data?: any;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: number;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type AsyncFunction<T = any> = () => Promise<T>;
export type VoidFunction = () => void;
