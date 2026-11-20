import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  calcMemberPrice,
  calcMemberSavings,
  FREE_FREIGHT_THRESHOLD,
  GST_RATE,
  MEMBERSHIP_ANNUAL_FEE,
  MEMBERSHIP_DISCOUNT_PCT,
  PRODUCTS,
} from '../data/products';
import { CartItem, MembershipCard, Order, UserAccount } from '../types/commerce';
import { HardwareImage, PriceDisplay } from './ui';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currentUser: UserAccount | null;
  membership: MembershipCard | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onPlaceOrder: (order: Order) => void;
  onOpenReturnPolicy?: () => void;
  onOpenMembership?: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  currentUser,
  membership,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onOpenReturnPolicy,
  onOpenMembership,
}: CartDrawerProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [recipientName, setRecipientName] = useState(currentUser?.fullName ?? '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName ?? '');
  const [address, setAddress] = useState(currentUser?.address ?? '');
  const [cityStateZip, setCityStateZip] = useState(currentUser?.city ?? '');
  const [shippingMethod, setShippingMethod] = useState<'Standard Parcel' | 'LTL Liftgate Freight'>(
    'LTL Liftgate Freight'
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'Corporate Card' | 'ACH Wire Transfer' | 'Net-30 Commercial'
  >('Corporate Card');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      setRecipientName((prev) => prev || currentUser.fullName);
      setCompanyName((prev) => prev || currentUser.companyName || '');
      setAddress((prev) => prev || currentUser.address);
      setCityStateZip((prev) => prev || currentUser.city);
    }
  }, [currentUser]);

  const isMember = Boolean(membership?.active);

  const resolvedItems = useMemo(() => {
    return items
      .map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        const variant = product?.variants.find((v) => v.id === item.variantId);
        if (!product || !variant) return null;
        const memberUnitPrice = calcMemberPrice(variant.price);
        const lineTotal = variant.price * item.quantity;
        const lineMemberDiscount = isMember
          ? calcMemberSavings(variant.price) * item.quantity
          : 0;
        return {
          ...item,
          product,
          variant,
          memberUnitPrice,
          lineTotal,
          lineMemberDiscount,
          linePayable: lineTotal - lineMemberDiscount,
          lineWeight: variant.weightKg * item.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [items, isMember]);

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalWeight = resolvedItems.reduce((sum, i) => sum + i.lineWeight, 0);
  const memberDiscount = resolvedItems.reduce((sum, i) => sum + i.lineMemberDiscount, 0);
  const taxableSubtotal = Math.max(0, subtotal - memberDiscount);
  const estimatedTax = Math.round(taxableSubtotal * GST_RATE);

  const qualifiedFreeFreight = isMember || subtotal >= FREE_FREIGHT_THRESHOLD;
  const shippingCost =
    subtotal === 0
      ? 0
      : qualifiedFreeFreight
        ? 0
        : shippingMethod === 'LTL Liftgate Freight'
          ? 18500
          : 2500;
  const total = taxableSubtotal + shippingCost + estimatedTax;
  const freightProgressPct = isMember
    ? 100
    : Math.min(100, Math.round((subtotal / FREE_FREIGHT_THRESHOLD) * 100));

  const whatsAppCartUrl = useMemo(() => {
    const lines = resolvedItems
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} (${i.variant.sku}) — Rs ${i.linePayable.toLocaleString('en-US')}${
            i.lineMemberDiscount > 0 ? ` (${MEMBERSHIP_DISCOUNT_PCT}% Member)` : ''
          }`
      )
      .join('\n');
    const msg = `Assalam-o-Alaikum VoltGrid Supply, I want to confirm my hardware order:\n${lines}\nSubtotal: Rs ${subtotal.toLocaleString('en-US')}${
      memberDiscount > 0
        ? `\nAnnual Member Discount (${MEMBERSHIP_DISCOUNT_PCT}% per product): -Rs ${memberDiscount.toLocaleString('en-US')}`
        : ''
    }\nSales Tax (18% GST): Rs ${estimatedTax.toLocaleString('en-US')}\nTotal Payable: Rs ${total.toLocaleString('en-US')}`;
    return buildWhatsAppUrl(msg);
  }, [resolvedItems, subtotal, memberDiscount, estimatedTax, total]);

  if (!isOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!recipientName.trim()) nextErrors.recipientName = 'Enter a recipient contact name.';
    if (!address.trim()) nextErrors.address = 'Enter a delivery street address.';
    if (!cityStateZip.trim()) nextErrors.cityStateZip = 'Enter city and region.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `VG-2026-${orderNum}`,
      createdAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Confirmed',
      shippingMethod,
      paymentMethod,
      recipientName: recipientName.trim(),
      companyName: companyName.trim() || undefined,
      address: address.trim(),
      cityStateZip: cityStateZip.trim(),
      items: resolvedItems.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        variantLabel: i.variant.label,
        sku: i.variant.sku,
        quantity: i.quantity,
        unitPrice: i.variant.price,
      })),
      subtotal,
      memberDiscount,
      shippingCost,
      tax: estimatedTax,
      total,
      trackingCode: `TCS-${orderNum}-PK`,
    };

    setErrors({});
    setCheckoutOpen(false);
    onPlaceOrder(newOrder);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Order Cart"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] h-full bg-[#FFFFFF] sm:m-3 sm:h-[calc(100%-1.5rem)] sm:rounded-xl border border-[#E2E8F0] shadow-level-3 flex flex-col overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#0369A1]" />
            <h2 className="text-[17px] font-bold text-[#0F172A]">
              Order Cart ({resolvedItems.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart drawer"
            className="w-9 h-9 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] inline-flex items-center justify-center text-[#475569] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Freight Progress Strip */}
        <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A]">
              <Truck className="w-3.5 h-3.5 text-[#0369A1]" />
              {isMember
                ? '1-Year Member: Free LTL Freight Unlocked'
                : qualifiedFreeFreight
                  ? 'Unlocked: Free LTL Liftgate Freight'
                  : `Add Rs ${(FREE_FREIGHT_THRESHOLD - subtotal).toLocaleString('en-US')} for free LTL freight`}
            </span>
            <span className="tabular-nums font-bold text-[#64748B]">
              {totalWeight.toFixed(1)} kg
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                qualifiedFreeFreight ? 'bg-[#10B981]' : 'bg-[#0369A1]'
              }`}
              style={{ width: `${freightProgressPct}%` }}
            />
          </div>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {resolvedItems.length === 0 ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-4">
              <ShoppingBag className="w-10 h-10 text-[#CBD5E1] mb-3" />
              <div className="text-[16px] font-bold text-[#0F172A]">Your hardware cart is empty</div>
              <p className="text-[13px] text-[#64748B] mt-1 max-w-[280px]">
                Select hybrid inverters, LiFePO4 battery banks, fridges, ACs, or combo deals to
                calculate PKR pricing and 18% GST.
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-[#F1F5F9]">
                {resolvedItems.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="py-3.5 first:pt-0">
                    <div className="flex items-start gap-3">
                      <HardwareImage
                        src={item.product.image}
                        alt={item.product.name}
                        containerClassName="w-16 h-16 rounded border border-[#E2E8F0] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[14px] font-semibold text-[#0F172A] leading-snug line-clamp-2">
                            {item.product.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId, item.variantId)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-[#64748B] hover:text-[#E11D48] p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-[12px] text-[#64748B] mt-0.5 tabular-nums">
                          {item.variant.label} · {item.variant.sku}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2.5">
                          <div className="inline-flex items-center border border-[#E2E8F0] rounded h-8 bg-[#F8FAFC]">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item.productId, item.variantId, -1)
                              }
                              aria-label="Decrease item quantity"
                              className="w-7 h-full inline-flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0]/60 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-[12px] font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item.productId, item.variantId, 1)
                              }
                              aria-label="Increase item quantity"
                              className="w-7 h-full inline-flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0]/60 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <PriceDisplay amount={item.linePayable} size="sm" />
                            {item.lineMemberDiscount > 0 && (
                              <div className="text-[11px] font-semibold text-[#047857] tabular-nums">
                                <span className="text-[#64748B] line-through mr-1.5">
                                  Rs {item.lineTotal.toLocaleString('en-US')}
                                </span>
                                -{MEMBERSHIP_DISCOUNT_PCT}% Member
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* 1-Year Membership Card Upsell / Active Status */}
              {onOpenMembership && (
                <div
                  className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${
                    isMember
                      ? 'border-[#A7F3D0] bg-[#ECFDF5]'
                      : 'border-[#BAE6FD] bg-[#F0F9FF]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Award
                      className={`w-4 h-4 shrink-0 ${
                        isMember ? 'text-[#047857]' : 'text-[#0369A1]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-[#0F172A] truncate">
                        {isMember
                          ? `1-Year Member Active (${membership?.id})`
                          : `Save Rs ${Math.round(subtotal * (MEMBERSHIP_DISCOUNT_PCT / 100)).toLocaleString('en-US')} with 1-Year Pass`}
                      </div>
                      <div className="text-[11px] text-[#475569]">
                        {isMember
                          ? `${MEMBERSHIP_DISCOUNT_PCT}% off + Free LTL Freight`
                          : `Rs ${MEMBERSHIP_ANNUAL_FEE.toLocaleString('en-US')}/yr · ${MEMBERSHIP_DISCOUNT_PCT}% off all orders`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMembership();
                    }}
                    className="h-8 px-2.5 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isMember ? 'View Card' : 'Get Pass'}
                  </button>
                </div>
              )}

              {/* Checkout Accordion */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen((o) => !o)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left bg-[#FFFFFF] border-b border-[#E2E8F0] cursor-pointer"
                >
                  <span className="text-[14px] font-bold text-[#0F172A]">
                    Shipping & Commercial Checkout
                  </span>
                  {checkoutOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#475569]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#475569]" />
                  )}
                </button>

                {checkoutOpen && (
                  <form onSubmit={handleCheckoutSubmit} className="p-4 space-y-3" noValidate>
                    <div>
                      <label htmlFor="chk-name" className="block spec-label text-[#64748B] mb-1">
                        RECIPIENT CONTACT *
                      </label>
                      <input
                        id="chk-name"
                        type="text"
                        value={recipientName}
                        onChange={(e) => {
                          setRecipientName(e.target.value);
                          if (errors.recipientName) {
                            setErrors((prev) => ({ ...prev, recipientName: '' }));
                          }
                        }}
                        placeholder="Full name"
                        className={`w-full h-10 px-3 rounded border bg-[#FFFFFF] text-[14px] text-[#0F172A] focus:outline-none ${
                          errors.recipientName
                            ? 'border-[#E11D48]'
                            : 'border-[#CBD5E1] focus:border-[#0369A1]'
                        }`}
                      />
                      {errors.recipientName && (
                        <p className="text-[12px] font-medium text-[#E11D48] mt-1">
                          {errors.recipientName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="chk-company" className="block spec-label text-[#64748B] mb-1">
                        COMPANY / JOB SITE (OPTIONAL)
                      </label>
                      <input
                        id="chk-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Organization or site reference"
                        className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#FFFFFF] text-[14px] text-[#0F172A] focus:outline-none focus:border-[#0369A1]"
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-address" className="block spec-label text-[#64748B] mb-1">
                        DELIVERY STREET ADDRESS *
                      </label>
                      <input
                        id="chk-address"
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                        }}
                        placeholder="Street address, plot or bay"
                        className={`w-full h-10 px-3 rounded border bg-[#FFFFFF] text-[14px] text-[#0F172A] focus:outline-none ${
                          errors.address
                            ? 'border-[#E11D48]'
                            : 'border-[#CBD5E1] focus:border-[#0369A1]'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-[12px] font-medium text-[#E11D48] mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="chk-city" className="block spec-label text-[#64748B] mb-1">
                        CITY & PROVINCE *
                      </label>
                      <input
                        id="chk-city"
                        type="text"
                        value={cityStateZip}
                        onChange={(e) => {
                          setCityStateZip(e.target.value);
                          if (errors.cityStateZip) {
                            setErrors((prev) => ({ ...prev, cityStateZip: '' }));
                          }
                        }}
                        placeholder="e.g., Lahore, Punjab 54660"
                        className={`w-full h-10 px-3 rounded border bg-[#FFFFFF] text-[14px] text-[#0F172A] focus:outline-none ${
                          errors.cityStateZip
                            ? 'border-[#E11D48]'
                            : 'border-[#CBD5E1] focus:border-[#0369A1]'
                        }`}
                      />
                      {errors.cityStateZip && (
                        <p className="text-[12px] font-medium text-[#E11D48] mt-1">
                          {errors.cityStateZip}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="chk-ship" className="block spec-label text-[#64748B] mb-1">
                          FREIGHT MODE
                        </label>
                        <select
                          id="chk-ship"
                          value={shippingMethod}
                          onChange={(e) =>
                            setShippingMethod(
                              e.target.value as 'Standard Parcel' | 'LTL Liftgate Freight'
                            )
                          }
                          className="w-full h-10 px-2.5 rounded border border-[#CBD5E1] bg-[#FFFFFF] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0369A1]"
                        >
                          <option value="LTL Liftgate Freight">LTL Liftgate</option>
                          <option value="Standard Parcel">Standard Parcel</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="chk-pay" className="block spec-label text-[#64748B] mb-1">
                          PAYMENT TERMS
                        </label>
                        <select
                          id="chk-pay"
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(
                              e.target.value as
                                | 'Corporate Card'
                                | 'ACH Wire Transfer'
                                | 'Net-30 Commercial'
                            )
                          }
                          className="w-full h-10 px-2.5 rounded border border-[#CBD5E1] bg-[#FFFFFF] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0369A1]"
                        >
                          <option value="Corporate Card">Card / Raast</option>
                          <option value="ACH Wire Transfer">IBFT / Bank Wire</option>
                          <option value="Net-30 Commercial">Net-30 Terms</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold transition-colors cursor-pointer mt-2"
                    >
                      Submit Order · Rs {Math.round(total).toLocaleString('en-US')}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Totals */}
        {resolvedItems.length > 0 && (
          <div className="p-5 border-t border-[#E2E8F0] bg-[#FFFFFF] space-y-3">
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-[#475569]">
                <span>Hardware Subtotal</span>
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  Rs {subtotal.toLocaleString('en-US')}
                </span>
              </div>
              {memberDiscount > 0 && (
                <div className="flex justify-between text-[#047857]">
                  <span>1-Year Member Discount ({MEMBERSHIP_DISCOUNT_PCT}%)</span>
                  <span className="font-bold tabular-nums">
                    -Rs {memberDiscount.toLocaleString('en-US')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#475569]">
                <span>{shippingMethod}</span>
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  {shippingCost === 0 ? 'Free' : `Rs ${shippingCost.toLocaleString('en-US')}`}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>FBR Sales Tax (18% GST)</span>
                <span className="font-semibold text-[#0F172A] tabular-nums">
                  Rs {estimatedTax.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#F1F5F9]">
                <span className="text-[14px] font-bold text-[#0F172A]">Order Total</span>
                <span className="text-[20px] font-extrabold text-[#0F172A] tabular-nums">
                  Rs {Math.round(total).toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!checkoutOpen && (
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full h-11 md:h-10 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[13px] font-bold transition-colors cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              )}

              <a
                href={whatsAppCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  checkoutOpen ? 'sm:col-span-2' : ''
                } w-full h-11 md:h-10 rounded bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

            {onOpenReturnPolicy && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReturnPolicy();
                  }}
                  className="text-[12px] font-semibold text-[#475569] hover:text-[#0369A1] hover:underline cursor-pointer"
                >
                  Protected by 90-Day Return Policy · View Terms
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
