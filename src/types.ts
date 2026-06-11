export type ProductSection = 'catalogo' | 'promociones';

export interface Product {
  code: string;
  name: string;
  category: string; // e.g., "Antibióticos", "Antiparasitarios", "Alimentos", "Accesorios"
  section: ProductSection; // 'catalogo' or 'promociones'
  description: string;
  vetPrice: number; // The default veterinarian price (base price)
  stock: number;
  image?: string; // Optional image URL or key
  badge?: string; // Optional promotional badge (e.g., "3x2", "Envío Gratis")
}

export interface WholesalerPrice {
  code: string;
  price: number;
}

export type DiscountTier = 'NONE' | '30%' | '40%' | '50%' | '50%+5%' | 'WHOLESALER';

export interface CartItem {
  product: Product;
  quantity: number;
  appliedDiscountTier: DiscountTier;
  finalUnitPrice: number;
}
