import { DivideIcon as LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  image_url: string;
  description: string;
  unit: string;
  stock_quantity: number;
  in_stock: boolean;
  disabled: boolean;
  newImage?: File;
}

export interface AdminProduct extends Product {
  category: Category | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: string;
  product: {
    name: string;
    unit: string;
  };
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  order_number: number;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  delivery_method: string;
  created_at: string;
  order_items: OrderItem[];
}

export interface AdminOrder extends Order {
  customer_name: string;
  /* user_profile: {
    first_name: string;
    last_name: string;
  }; */
}

export interface TabItem {
  id: string;
  label: string;
  icon: typeof LucideIcon;
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusTranslations {
  [key: string]: string;  
}