export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
  is_custom?: boolean | null;
  created_at?: string; // (ใน MenuPage.tsx ใช้ created_at ที่เป็น string)
};

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