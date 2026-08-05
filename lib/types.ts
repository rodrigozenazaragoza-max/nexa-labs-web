export type ProductProperty = { label: string; value: string };
export type ProductFaqItem = { question: string; answer: string };

export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  price_mxn: number;
  stock: number;
  image_url: string | null;
  sku: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  category: string;
  purity: string;
  price_mxn: number;
  stock: number;
  image_url: string | null;
  coa_url: string | null;
  on_sale: boolean;
  long_description: string | null;
  properties: ProductProperty[] | null;
  research_notes: string | null;
  faq: ProductFaqItem[] | null;
  variants?: ProductVariant[];
};

export type CartItem = {
  key: string; // product.id, o `${product.id}:${variant.id}` si tiene presentación
  product: Product;
  variant: ProductVariant | null;
  qty: number;
};

export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  confirmsResearchUse: boolean;
  confirmsAge: boolean;
};
