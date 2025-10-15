export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  data_nascimento?: string;
  telefone?: string;
  uf?: string;
  estado?: string;
  endereco?: string;
  bairro?: string;
  complemento?: string;
  cep?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock: number;
  images: string[];
  brand: string;
  specifications: string[];
  category_id: number;
  category?: Category;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  session_id: string;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_transaction_id?: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaymentData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: 'credit_card' | 'pix' | 'boleto';
  card_data?: {
    number: string;
    holder_name: string;
    expiry_month: number;
    expiry_year: number;
    cvv: string;
  };
}