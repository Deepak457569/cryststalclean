// Frontend Types for CrystalClean

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

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  'New Inquiry': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Contacted': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Quotation Shared': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Awaiting Customer Confirmation': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Preparing Order': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Ready to Ship': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Shipped': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Delivered': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: number;
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
  is_active: number;
  created_at?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variant?: string | null;
  packSize?: string | null;
  quantity: number;
  imageUrl: string;
}

export interface AccessCode {
  id: string;
  code: string;
  client_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  status: 'active' | 'revoked' | 'expired' | 'exhausted';
  created_at: string;
}

export interface InquiryItem {
  id: string;
  inquiry_id: string;
  product_id?: string | null;
  product_name_snapshot: string;
  variant_snapshot?: string | null;
  pack_size_snapshot?: string | null;
  quantity: number;
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

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}
