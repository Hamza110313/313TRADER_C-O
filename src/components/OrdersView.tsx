import React from 'react';
import { CheckCircle2, PackageCheck, Truck } from 'lucide-react';
import { MEMBERSHIP_DISCOUNT_PCT } from '../data/products';
import { Order } from '../types/commerce';

interface OrdersViewProps {
  orders: Order[];
  latestOrderId: string | null;
  onSelectProduct: (productId: string) => void;
  onBackToCatalog: () => void;
  onOpenReturnPolicy?: () => void;
}

export function OrdersView({
  orders,
  latestOrderId,
  onSelectProduct,
  onBackToCatalog,
  onOpenReturnPolicy,
}: OrdersViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A]">
            Orders & Freight Dispatch
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Track commercial hardware shipments, LTL liftgate manifests, and itemized SKU receipts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onOpenReturnPolicy && (
            <button
              type="button"
              onClick={onOpenReturnPolicy}
              className="h-10 px-4 rounded border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[13px] font-semibold text-[#0369A1] whitespace-nowrap cursor-pointer"
            >
              90-Day Return Policy / RMA
            </button>
          )}
          <button
            type="button"
            onClick={onBackToCatalog}
            className="h-10 px-4 rounded border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[13px] font-semibold text-[#0F172A] whitespace-nowrap cursor-pointer"
          >
            Continue Browsing Catalog
          </button>
        </div>
      </div>

      {latestOrderId && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 sm:p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
          <div>
            <div className="text-[15px] font-bold text-[#0F172A]">
              Order #{latestOrderId} Confirmed — Preparing Freight Dispatch
            </div>
            <p className="text-[13px] text-[#065F46] mt-0.5">
              Your hardware allocation is reserved and queued for warehouse verification. Tracking
              updates will post to this manifest.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-level-1 overflow-hidden"
          >
            {/* Order Header */}
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <div className="spec-label text-[#64748B]">ORDER ID</div>
                  <div className="spec-value text-[14px] text-[#0F172A] mt-0.5">#{order.id}</div>
                </div>
                <div>
                  <div className="spec-label text-[#64748B]">PLACED</div>
                  <div className="spec-value text-[13px] text-[#475569] mt-0.5">
                    {order.createdAt}
                  </div>
                </div>
                <div>
                  <div className="spec-label text-[#64748B]">FREIGHT / TERMS</div>
                  <div className="spec-value text-[13px] text-[#475569] mt-0.5">
                    {order.shippingMethod} · {order.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border spec-label ${
                    order.status === 'Delivered'
                      ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                      : order.status === 'In Transit'
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        : 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]'
                  }`}
                >
                  {order.status === 'Delivered' ? (
                    <PackageCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Truck className="w-3.5 h-3.5" />
                  )}
                  <span>{order.status}</span>
                </span>
                <span className="text-[18px] font-extrabold text-[#0F172A] tabular-nums">
                  Rs {Math.round(order.total).toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Destination & Tracking */}
            <div className="px-5 py-3 border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#475569]">
              <div>
                <span className="font-semibold text-[#0F172A]">{order.recipientName}</span>
                {order.companyName ? ` (${order.companyName})` : ''} · {order.address},{' '}
                {order.cityStateZip}
              </div>
              <div className="tabular-nums text-[12px] font-semibold text-[#64748B]">
                Waybill: <span className="text-[#0F172A]">{order.trackingCode}</span>
              </div>
            </div>

            {/* Itemized Lines */}
            <div className="divide-y divide-[#F1F5F9]">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.sku}`}
                  className="px-5 py-2.5 flex items-center justify-between gap-4 text-[13px]"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(item.productId)}
                      className="font-semibold text-[#0F172A] hover:text-[#0369A1] text-left cursor-pointer"
                    >
                      {item.productName}
                    </button>
                    <div className="text-[12px] text-[#64748B] tabular-nums">
                      {item.variantLabel} · {item.sku} · Qty {item.quantity}
                    </div>
                  </div>
                  <div className="font-bold text-[#0F172A] tabular-nums whitespace-nowrap">
                    Rs {(item.unitPrice * item.quantity).toLocaleString('en-US')}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#475569] tabular-nums">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Subtotal: Rs {order.subtotal.toLocaleString('en-US')}</span>
                {order.memberDiscount && order.memberDiscount > 0 ? (
                  <span className="font-semibold text-[#047857]">
                    1-Yr Member ({MEMBERSHIP_DISCOUNT_PCT}%): -Rs{' '}
                    {order.memberDiscount.toLocaleString('en-US')}
                  </span>
                ) : null}
                <span>
                  Freight:{' '}
                  {order.shippingCost === 0
                    ? 'Free'
                    : `Rs ${order.shippingCost.toLocaleString('en-US')}`}
                </span>
                <span>FBR Tax (18% GST): Rs {Math.round(order.tax).toLocaleString('en-US')}</span>
              </div>
              <span className="font-extrabold text-[#0F172A]">
                Paid: Rs {Math.round(order.total).toLocaleString('en-US')}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
