// Environment and Database Types for Cloudflare Worker

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  BUCKET?: R2Bucket;
  ENVIRONMENT?: string;
  BUSINESS_WHATSAPP?: string;
  ADMIN_EMAILS?: string;
  ADMIN_ALLOWLIST?: string;
  INITIAL_ADMIN_EMAIL?: string;
  JWT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  TURNSTILE_SECRET?: string;
  APP_BASE_URL?: string;
  ADMIN_PASSCODE?: string;
}

export type OrderStatus =
  | 'New Inquiry'
  | 'Contacted'
  | 'Quotation Shared'
  | 'Awaiting Customer Confirmation'
  | 'Confirmed'
  | 'Preparing Order'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'New Inquiry',
  'Contacted',
  'Quotation Shared',
  'Awaiting Customer Confirmation',
  'Confirmed',
  'Preparing Order',
  'Ready to Ship',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  image_url: string;
  gallery_json: string;
  variants_json: string;
  pack_size: string | null;
  specs_json: string;
  is_featured: number;
  is_customizable?: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface AccessCode {
  id: string;
  code: string;
  code_hash?: string;
  client_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  status: 'active' | 'revoked' | 'expired' | 'exhausted';
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InquiryItem {
  id: string;
  inquiry_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  variant_snapshot: string | null;
  pack_size_snapshot: string | null;
  quantity: number;
}

export interface Inquiry {
  id: string;
  reference: string;
  inquiry_type: 'cart' | 'bulk_quote';
  customer_name: string;
  company_name: string;
  contact_phone: string;
  contact_email: string | null;
  delivery_city: string;
  expected_date: string | null;
  notes: string | null;
  access_code_id: string | null;
  access_code_value?: string;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: InquiryItem[];
}

export interface InquiryStatusHistory {
  id: string;
  inquiry_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string;
  changed_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}
