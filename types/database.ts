// types/database.ts

// ─────────────────────────────
// User profile type
// ─────────────────────────────
export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
};

// ─────────────────────────────
// Product type
// ─────────────────────────────
export type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  created_at?: string;
};

// ─────────────────────────────
// Cart item type
// ─────────────────────────────
export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  note?: string;
  custom?: {
    color?: string;
    text?: string;
  };
  created_at?: string;
  product?: Product; // optional relation
};

// ─────────────────────────────
// Order type
// ─────────────────────────────
export type Order = {
  id: string;
  user_id: string;
  total: number;
  items: CartItem[];
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
};
