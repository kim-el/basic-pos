export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  tax: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  customerName?: string;
}

export interface DailySales {
  total_sales: number;
  total_transactions: number;
  sale_date: string;
}