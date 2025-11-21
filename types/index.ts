export interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: string;
  is_custom: boolean;
  created_at?: string;
}

export interface ProductInsert {
  name: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
  category: string;
  is_custom: boolean;
}

export type ProductImage = {
  id: string
  product_id: string
  path: string
}

export type CustomCakePayload = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  custom_options: Record<string, unknown>;
};