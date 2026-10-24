export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface OrderData {
  name: string;
  email: string;
  phone: string;
  address: string;
  quantity: number;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerReview {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  cartItems: CartItem[];
  totalAmount: number;
  orderNumber: string;
  timestamp: string;
}

export interface Order extends CheckoutData {
  accountNumber: string;
  paymentMethod: string;
  status: string;
  paidAt: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  transaction_id: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}