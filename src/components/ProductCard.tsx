import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, GitCompareArrows, ShoppingBag } from 'lucide-react';
import { calcMemberPrice, MEMBERSHIP_DISCOUNT_PCT } from '../data/products';
import { Product } from '../types/commerce';
import { calcSavingsPct, HardwareImage, PriceDisplay, SemanticBadge } from './ui';

interface ProductCardProps {
  product: Product;
  isCompared: boolean;
  isMember?: boolean;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (productId: string, variantId: string) => void;
  onToggleCompare: (productId: string) => void;
}

export function ProductCard({
  product,
  isCompared,
  isMember = false,
  onSelectProduct,
  onAddToCart,
  onToggleCompare,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const gallery =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const currentPhoto = gallery[photoIdx] ?? product.image;

  const primaryVariant = product.variants[0];
  const displayPrice = isMember ? calcMemberPrice(primaryVariant.price) : primaryVariant.price;
  const savingsPct = calcSavingsPct(primaryVariant.price, primaryVariant.originalPrice);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id, primaryVariant.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg p-4 shadow-level-1 hover:shadow-level-2 transition-all duration-150 hover:-translate-y-0.5 flex flex-col">
      {/* 1:1 Image Container with Multi-Photo Switcher */}
      <div
        onClick={() => onSelectProduct(product.id)}
        className="relative aspect-square w-full rounded bg-[#F8FAFC] border border-[#F1F5F9] overflow-hidden cursor-pointer mb-3.5"
      >
        <HardwareImage
          src={currentPhoto}
          alt={`${product.name} photo ${photoIdx + 1}`}
          containerClassName="w-full h-full"
          className="transition-transform duration-200 group-hover:scale-[1.02]"
        />
        <div className="absolute top-2.5 left-2.5">
          <SemanticBadge label={product.badge.label} tone={product.badge.tone} />
        </div>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length);
              }}
              aria-label={`Previous photo of ${product.name}`}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E2E8F0] shadow-level-1 inline-flex items-center justify-center text-[#0F172A] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i + 1) % gallery.length);
              }}
              aria-label={`Next photo of ${product.name}`}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E2E8F0] shadow-level-1 inline-flex items-center justify-center text-[#0F172A] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
              {gallery.map((_, idx) => (
                <button
                  key={`${product.id}-dot-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIdx(idx);
                  }}
                  aria-label={`Show photo ${idx + 1}`}
                  className={`pointer-events-auto h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === photoIdx ? 'w-4 bg-[#0369A1]' : 'w-1.5 bg-[#FFFFFF]/85 hover:bg-[#FFFFFF]'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Manufacturer & SKU Metadata (Unboxed with · separator) */}
      <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] mb-1 truncate">
        <span className="truncate font-medium">{product.manufacturer}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums shrink-0">{primaryVariant.sku}</span>
      </div>

      {/* Product Title */}
      <button
        type="button"
        onClick={() => onSelectProduct(product.id)}
        className="text-left text-[16px] font-semibold leading-[22px] text-[#0F172A] hover:text-[#0369A1] transition-colors line-clamp-2 mb-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded"
      >
        {product.name}
      </button>

      {/* Quick-Spec 2-Column Micro-Grid */}
      <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] border border-[#F1F5F9] rounded px-2.5 py-2 mb-3.5">
        {product.quickSpecs.map((spec) => (
          <div key={spec.label} className="min-w-0">
            <div className="spec-label text-[#64748B] truncate">{spec.label}</div>
            <div className="spec-value text-[#0F172A] truncate mt-0.5">{spec.value}</div>
          </div>
        ))}
      </div>

      {/* Pricing Lockup & Unit Efficiency */}
      <div className="mt-auto pt-1 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <PriceDisplay amount={displayPrice} size="card" />
            {isMember ? (
              <>
                <span className="text-[13px] text-[#64748B] line-through tabular-nums">
                  Rs {primaryVariant.price.toLocaleString('en-US')}
                </span>
                <span className="text-[12px] font-bold text-[#047857] tabular-nums">
                  -{MEMBERSHIP_DISCOUNT_PCT}% Member
                </span>
              </>
            ) : (
              <>
                {primaryVariant.originalPrice && (
                  <span className="text-[13px] text-[#64748B] line-through tabular-nums">
                    Rs {primaryVariant.originalPrice.toLocaleString('en-US')}
                  </span>
                )}
                {savingsPct !== null && (
                  <span className="text-[12px] font-bold text-[#E11D48] tabular-nums">
                    -{savingsPct}%
                  </span>
                )}
              </>
            )}
          </div>
          <span className="text-[12px] font-semibold text-[#475569] tabular-nums whitespace-nowrap">
            {primaryVariant.unitMetric}
          </span>
        </div>

        {/* Bottom Action Layer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`flex-1 h-12 md:h-10 px-3 rounded text-[13px] font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 ${
              justAdded
                ? 'bg-[#10B981] text-white'
                : 'bg-[#0369A1] hover:bg-[#075985] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product.id);
            }}
            aria-label={isCompared ? `Remove ${product.name} from comparison` : `Compare ${product.name}`}
            title={isCompared ? 'Pinned for Comparison' : 'Add to Compare'}
            className={`w-12 md:w-10 h-12 md:h-10 rounded border inline-flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
              isCompared
                ? 'bg-[#0369A1] border-[#0369A1] text-white'
                : 'bg-transparent border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]'
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
