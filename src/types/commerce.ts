export type CategoryId =
  | 'all'
  | 'inverters'
  | 'batteries'
  | 'solar'
  | 'controllers'
  | 'fans'
  | 'lighting'
  | 'wiring'
  | 'appliances'
  | 'combos';

export type ActiveView =
  | 'catalog'
  | 'product'
  | 'spec-search'
  | 'orders'
  | 'register'
  | 'returns'
  | 'membership';

export interface MembershipCard {
  id: string;
  holderName: string;
  phone: string;
  city: string;
  tier: 'VoltGrid Annual Pass (1 Year)';
  annualFee: number;
  discountPct: number;
  issuedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface UserAccount {
  id: string;
  accountType: 'residential' | 'commercial';
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  ntnNumber?: string;
  city: string;
  address: string;
  createdAt: string;
}

export type BadgeTone = 'eco' | 'yield' | 'alert';

export interface ProductBadge {
  label: string;
  tone: BadgeTone;
}

export interface ProductVariant {
  id: string;
  label: string;
  sku: string;
  price: number;
  originalPrice?: number;
  powerRatingWatts: number;
  capacityWh?: number;
  unitMetric: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Ships in 48h';
  weightKg: number;
}

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: Exclude<CategoryId, 'all'>;
  categoryLabel: string;
  image: string;
  gallery?: string[];
  badge: ProductBadge;
  summary: string;
  voltageBus: '48V / 51.2V' | '400V HV' | '24V' | 'AC Coupled';
  efficiencyPct: number;
  enclosureRating: 'IP65' | 'IP67' | 'IP20' | 'NEMA 4X';
  quickSpecs: [
    { label: string; value: string },
    { label: string; value: string }
  ];
  certifications: string[];
  warrantyYears: number;
  variants: ProductVariant[];
  specs: ProductSpecRow[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderItemSummary {
  productId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'Confirmed' | 'In Transit' | 'Delivered';
  shippingMethod: 'Standard Parcel' | 'LTL Liftgate Freight';
  paymentMethod: 'Corporate Card' | 'ACH Wire Transfer' | 'Net-30 Commercial';
  recipientName: string;
  companyName?: string;
  address: string;
  cityStateZip: string;
  items: OrderItemSummary[];
  subtotal: number;
  memberDiscount?: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingCode: string;
}
