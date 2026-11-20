import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  calcMemberPrice,
  calcMemberSavings,
  MEMBERSHIP_DISCOUNT_PCT,
  PRODUCTS,
} from '../data/products';
import { CategoryId, Product } from '../types/commerce';
import { calcSavingsPct, HardwareImage, PriceDisplay, SemanticBadge } from './ui';

interface ProductDetailViewProps {
  product: Product;
  isCompared: boolean;
  isMember?: boolean;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onSelectCategory?: (category: CategoryId) => void;
  onAddToCart: (productId: string, variantId: string, quantity: number) => void;
  onToggleCompare: (productId: string) => void;
  onGoToCompare: () => void;
  onOpenReturnPolicy?: () => void;
  onOpenMembership?: () => void;
}

export function ProductDetailView({
  product,
  isCompared,
  isMember = false,
  onBack,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
  onToggleCompare,
  onGoToCompare,
  onOpenReturnPolicy,
  onOpenMembership,
}: ProductDetailViewProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const gallery =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const activePhoto = gallery[activeImageIdx] ?? product.image;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const defaultLoadWatts = Math.max(
    100,
    Math.min(activeVariant.powerRatingWatts, Math.round(activeVariant.powerRatingWatts * 0.55))
  );
  const [loadWatts, setLoadWatts] = useState(defaultLoadWatts);
  const [dailyHours, setDailyHours] = useState(product.category === 'solar' ? 5 : 10);

  const savingsPct = calcSavingsPct(activeVariant.price, activeVariant.originalPrice);
  const memberUnitPrice = calcMemberPrice(activeVariant.price);
  const unitPayable = isMember ? memberUnitPrice : activeVariant.price;
  const memberSavingsTotal = calcMemberSavings(activeVariant.price) * quantity;

  const productIndex = PRODUCTS.findIndex((p) => p.id === product.id);
  const prevProduct = PRODUCTS[(productIndex - 1 + PRODUCTS.length) % PRODUCTS.length];
  const nextProduct = PRODUCTS[(productIndex + 1) % PRODUCTS.length];

  const relatedProducts = useMemo(() => {
    const sameCategory = PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const others = PRODUCTS.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [product.id, product.category]);

  const handleAdd = () => {
    onAddToCart(product.id, activeVariant.id, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  // Category-tailored engineering sizing calculation
  const capacityWh = activeVariant.capacityWh ?? activeVariant.powerRatingWatts * 4;
  const effectiveWh = capacityWh * (product.efficiencyPct / 100);
  const estimatedHours = loadWatts > 0 ? (effectiveWh / loadWatts).toFixed(1) : '—';
  const loadUtilizationPct = Math.min(
    100,
    Math.round((loadWatts / Math.max(1, activeVariant.powerRatingWatts)) * 100)
  );

  const isSolar = product.category === 'solar';
  const isApplianceOrLoad =
    product.category === 'appliances' ||
    product.category === 'fans' ||
    product.category === 'lighting';

  const dailySolarYieldKwh = ((activeVariant.powerRatingWatts * dailyHours * (product.efficiencyPct / 100)) / 1000).toFixed(2);
  const monthlySolarYieldKwh = Math.round(Number(dailySolarYieldKwh) * 30);
  const dailyApplianceKwh = ((activeVariant.powerRatingWatts * dailyHours) / 1000).toFixed(2);
  const batteryAh48V = Math.round((activeVariant.powerRatingWatts * dailyHours) / 48);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Per-Product Page Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded px-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog</span>
          </button>
          <span aria-hidden="true" className="text-[#CBD5E1]">/</span>
          {onSelectCategory ? (
            <button
              type="button"
              onClick={() => onSelectCategory(product.category)}
              className="text-[13px] font-semibold text-[#0369A1] hover:underline cursor-pointer"
            >
              {product.categoryLabel}
            </button>
          ) : (
            <span className="text-[13px] font-semibold text-[#475569]">
              {product.categoryLabel}
            </span>
          )}
          <span aria-hidden="true" className="text-[#CBD5E1]">/</span>
          <span className="text-[13px] font-bold text-[#0F172A] tabular-nums">
            {activeVariant.sku}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectProduct(prevProduct.id)}
            title={prevProduct.name}
            className="h-8 px-2.5 rounded border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[12px] font-semibold text-[#475569] hover:text-[#0F172A] inline-flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Product</span>
          </button>
          <span className="text-[11px] font-bold text-[#64748B] tabular-nums px-1">
            {productIndex + 1} / {PRODUCTS.length}
          </span>
          <button
            type="button"
            onClick={() => onSelectProduct(nextProduct.id)}
            title={nextProduct.name}
            className="h-8 px-2.5 rounded border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[12px] font-semibold text-[#475569] hover:text-[#0F172A] inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline">Next Product</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Gallery Left + Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 1:1 Hardware Gallery + Sizing Calculator */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
          <div className="relative bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 shadow-level-1">
            <div className="relative aspect-square w-full rounded bg-[#F8FAFC] overflow-hidden">
              <HardwareImage
                src={activePhoto}
                alt={`${product.name} — View ${activeImageIdx + 1}`}
                containerClassName="w-full h-full"
              />
              <div className="absolute top-3 left-3">
                <SemanticBadge label={product.badge.label} tone={product.badge.tone} />
              </div>

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((i) => (i - 1 + gallery.length) % gallery.length)
                    }
                    aria-label="Previous product photo"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E2E8F0] shadow-level-1 inline-flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((i) => (i + 1) % gallery.length)}
                    aria-label="Next product photo"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E2E8F0] shadow-level-1 inline-flex items-center justify-center text-[#0F172A] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-[#0F172A]/75 text-white text-[11px] font-bold tabular-nums">
                    {activeImageIdx + 1} / {gallery.length}
                  </div>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {gallery.map((imgUrl, idx) => {
                  const selected = idx === activeImageIdx;
                  return (
                    <button
                      key={`${product.id}-thumb-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      aria-label={`View photo ${idx + 1} of ${product.name}`}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer ${
                        selected
                          ? 'border-[#0369A1] ring-2 ring-[#0369A1]/20'
                          : 'border-[#E2E8F0] hover:border-[#94A3B8] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <HardwareImage
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        containerClassName="w-full h-full"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#0F172A]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>{product.warrantyYears}-Year Warranty</span>
                <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                <button
                  type="button"
                  onClick={onOpenReturnPolicy}
                  className="text-[#0369A1] hover:underline cursor-pointer"
                >
                  90-Day Return Policy
                </button>
              </div>
              <div className="text-[12px] text-[#64748B] font-medium">
                {product.certifications.join(' · ')}
              </div>
            </div>
          </div>

          {/* Category-Tailored Engineering Sizing Estimator */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 shadow-level-1 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0369A1]" />
                <h2 className="text-[15px] font-bold text-[#0F172A]">
                  {isSolar
                    ? 'Daily Array Yield & Peak Sun Estimator'
                    : isApplianceOrLoad
                      ? 'Duty Cycle & Solar Pairing Estimator'
                      : 'System Load & Headroom Calculator'}
                </h2>
              </div>
              <span className="spec-label text-[#64748B]">{product.voltageBus}</span>
            </div>

            {isSolar || isApplianceOrLoad ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <label htmlFor="daily-hours-slider" className="font-semibold text-[#475569]">
                      {isSolar ? 'Peak Sun Hours (Pakistan Avg 4.5–6.0h)' : 'Daily Operating Hours'}
                    </label>
                    <span className="font-bold text-[#0F172A] tabular-nums">
                      {dailyHours} hrs / day
                    </span>
                  </div>
                  <input
                    id="daily-hours-slider"
                    type="range"
                    min={isSolar ? 3 : 2}
                    max={isSolar ? 8 : 24}
                    step={1}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-[#0369A1] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3">
                  <div>
                    <div className="spec-label text-[#64748B]">
                      {isSolar ? 'ARRAY POWER' : 'RATED DRAW'}
                    </div>
                    <div className="spec-value text-[14px] text-[#0F172A] mt-0.5">
                      {activeVariant.powerRatingWatts.toLocaleString('en-US')} W
                    </div>
                  </div>
                  <div>
                    <div className="spec-label text-[#64748B]">
                      {isSolar ? 'DAILY YIELD' : 'DAILY USE'}
                    </div>
                    <div className="spec-value text-[14px] text-[#0369A1] mt-0.5">
                      {isSolar ? `${dailySolarYieldKwh} kWh` : `${dailyApplianceKwh} kWh`}
                    </div>
                  </div>
                  <div>
                    <div className="spec-label text-[#64748B]">
                      {isSolar ? 'MONTHLY YIELD' : '48V BATT REQ.'}
                    </div>
                    <div className="spec-value text-[14px] text-[#047857] mt-0.5">
                      {isSolar ? `${monthlySolarYieldKwh} kWh` : `${batteryAh48V} Ah`}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <label htmlFor="load-watts-slider" className="font-semibold text-[#475569]">
                      Target Continuous Load
                    </label>
                    <span className="font-bold text-[#0F172A] tabular-nums">
                      {loadWatts.toLocaleString('en-US')} W
                    </span>
                  </div>
                  <input
                    id="load-watts-slider"
                    type="range"
                    min={100}
                    max={Math.max(1000, activeVariant.powerRatingWatts)}
                    step={100}
                    value={Math.min(loadWatts, Math.max(1000, activeVariant.powerRatingWatts))}
                    onChange={(e) => setLoadWatts(Number(e.target.value))}
                    className="w-full accent-[#0369A1] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded p-3">
                  <div>
                    <div className="spec-label text-[#64748B]">RATED OUTPUT</div>
                    <div className="spec-value text-[14px] text-[#0F172A] mt-0.5">
                      {activeVariant.powerRatingWatts.toLocaleString('en-US')} W
                    </div>
                  </div>
                  <div>
                    <div className="spec-label text-[#64748B]">LOAD RATIO</div>
                    <div
                      className={`spec-value text-[14px] mt-0.5 ${
                        loadUtilizationPct > 90 ? 'text-[#E11D48]' : 'text-[#0F172A]'
                      }`}
                    >
                      {loadUtilizationPct}%
                    </div>
                  </div>
                  <div>
                    <div className="spec-label text-[#64748B]">
                      {activeVariant.capacityWh ? 'EST. RUNTIME' : '4H CAPACITY'}
                    </div>
                    <div className="spec-value text-[14px] text-[#0369A1] mt-0.5">
                      {activeVariant.capacityWh
                        ? `${estimatedHours} hrs`
                        : `${((activeVariant.powerRatingWatts * 4) / 1000).toFixed(1)} kWh`}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Contiguous Purchase Module + Technical Spec Table */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-6 shadow-level-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[12px] text-[#64748B] mb-1.5">
                <span className="font-semibold text-[#475569]">{product.manufacturer}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeVariant.sku}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-semibold ${
                    activeVariant.stockStatus === 'In Stock'
                      ? 'text-[#047857]'
                      : 'text-[#B45309]'
                  }`}
                >
                  {activeVariant.stockStatus}
                </span>
              </div>

              <h1 className="text-[24px] sm:text-[28px] font-bold leading-[34px] tracking-[-0.02em] text-[#0F172A] text-balance">
                {product.name}
              </h1>

              <p className="mt-2.5 text-[14px] leading-[22px] text-[#475569]">{product.summary}</p>
            </div>

            {/* Variant Selector */}
            <div className="space-y-2 pt-1">
              <div className="spec-label text-[#64748B]">CONFIGURATION / CAPACITY</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((variant) => {
                  const selected = variant.id === activeVariant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`p-3 rounded border text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                        selected
                          ? 'border-[#0369A1] bg-[#F0F9FF] text-[#0F172A]'
                          : 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#475569]'
                      }`}
                    >
                      <div className="text-[13px] font-bold text-[#0F172A]">{variant.label}</div>
                      <div className="flex items-center justify-between mt-1 text-[12px] tabular-nums">
                        <span className="font-semibold text-[#0369A1]">
                          Rs {(isMember ? calcMemberPrice(variant.price) : variant.price).toLocaleString('en-US')}
                        </span>
                        <span className="text-[#64748B]">{variant.unitMetric}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing Lockup */}
            <div className="pt-2 pb-1 border-t border-[#F1F5F9] space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <PriceDisplay amount={unitPayable * quantity} size="hero" />
                  {isMember ? (
                    <>
                      <span className="text-[16px] text-[#64748B] line-through tabular-nums">
                        Rs {(activeVariant.price * quantity).toLocaleString('en-US')}
                      </span>
                      <span className="text-[14px] font-bold text-[#047857] tabular-nums">
                        {MEMBERSHIP_DISCOUNT_PCT}% Member Off (-Rs{' '}
                        {memberSavingsTotal.toLocaleString('en-US')})
                      </span>
                    </>
                  ) : (
                    <>
                      {activeVariant.originalPrice && (
                        <span className="text-[16px] text-[#64748B] line-through tabular-nums">
                          Rs {(activeVariant.originalPrice * quantity).toLocaleString('en-US')}
                        </span>
                      )}
                      {savingsPct !== null && (
                        <span className="text-[14px] font-bold text-[#E11D48] tabular-nums">
                          Save {savingsPct}%
                        </span>
                      )}
                    </>
                  )}
                </div>

                <span className="text-[13px] font-semibold text-[#475569] tabular-nums">
                  {activeVariant.unitMetric} · {activeVariant.weightKg} kg
                </span>
              </div>

              {!isMember && onOpenMembership && (
                <button
                  type="button"
                  onClick={onOpenMembership}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0369A1] hover:underline cursor-pointer tabular-nums"
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Members Only: Pay Rs {(memberUnitPrice * quantity).toLocaleString('en-US')} (
                    {MEMBERSHIP_DISCOUNT_PCT}% off this product with 1-Yr Pass)
                  </span>
                </button>
              )}
            </div>

            {/* Quantity Stepper + Primary CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center border border-[#CBD5E1] rounded h-12 md:h-10 bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-full inline-flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0]/50 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-[14px] font-bold tabular-nums text-[#0F172A]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-full inline-flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0]/50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 min-w-[180px] h-12 md:h-10 px-5 rounded text-[14px] font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 ${
                  justAdded
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#0369A1] hover:bg-[#075985] text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Order Cart</span>
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
                onClick={() => {
                  onToggleCompare(product.id);
                }}
                className={`h-12 md:h-10 px-4 rounded border text-[13px] font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                  isCompared
                    ? 'bg-[#0369A1] border-[#0369A1] text-white'
                    : 'bg-transparent border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]'
                }`}
              >
                <GitCompareArrows className="w-4 h-4" />
                <span>{isCompared ? 'Pinned' : 'Compare'}</span>
              </button>
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
              <a
                href={buildWhatsAppUrl(
                  `Assalam-o-Alaikum VoltGrid Supply, I would like a quote/order for ${quantity}x ${product.name} (${activeVariant.label}, SKU: ${activeVariant.sku}) — Total Rs ${(unitPayable * quantity).toLocaleString('en-US')}${
                    isMember ? ` (1-Yr Member ${MEMBERSHIP_DISCOUNT_PCT}% Off)` : ''
                  }.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#047857] hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order / Ask Engineer on WhatsApp</span>
              </a>

              {isCompared && (
                <button
                  type="button"
                  onClick={onGoToCompare}
                  className="text-[13px] font-semibold text-[#0369A1] hover:underline cursor-pointer"
                >
                  View Side-by-Side Comparison Matrix →
                </button>
              )}
            </div>
          </div>

          {/* Technical Specification Table: Strictly 36px row height, alternating #FFFFFF / #F8FAFC */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-level-1">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#0F172A]">Technical Specifications</h2>
              <span className="spec-label text-[#64748B]">ENCLOSURE {product.enclosureRating}</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {product.specs.map((row, idx) => (
                <div
                  key={row.label}
                  className={`h-[36px] px-4 flex items-center justify-between gap-4 ${
                    idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC]'
                  }`}
                >
                  <span className="spec-label text-[#64748B] truncate">{row.label}</span>
                  <span className="spec-value text-[#0F172A] text-right whitespace-nowrap">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Related & Other Product Pages */}
      <section aria-label="Related Product Pages" className="pt-4 border-t border-[#E2E8F0] space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#0F172A]">
              Explore Individual Product Pages
            </h2>
            <p className="text-[13px] text-[#64748B]">
              Jump directly to dedicated technical specs and PKR pricing for related hardware.
            </p>
          </div>
          {onSelectCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory(product.category)}
              className="text-[13px] font-semibold text-[#0369A1] hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>All {product.categoryLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedProducts.map((other) => {
            const v = other.variants[0];
            const otherPrice = isMember ? calcMemberPrice(v.price) : v.price;
            return (
              <button
                key={other.id}
                type="button"
                onClick={() => onSelectProduct(other.id)}
                className="text-left bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#0369A1] rounded-lg p-3.5 shadow-level-1 hover:shadow-level-2 transition-all cursor-pointer flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <HardwareImage
                    src={other.image}
                    alt={other.name}
                    containerClassName="w-16 h-16 rounded border border-[#F1F5F9] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="spec-label text-[#64748B] truncate">
                      {other.categoryLabel}
                    </div>
                    <div className="text-[14px] font-semibold text-[#0F172A] line-clamp-2 leading-snug mt-0.5">
                      {other.name}
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <PriceDisplay amount={otherPrice} size="sm" />
                    {isMember && (
                      <span className="text-[11px] font-bold text-[#047857] tabular-nums">
                        -{MEMBERSHIP_DISCOUNT_PCT}%
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-[#0369A1] inline-flex items-center gap-1">
                    <span>Open Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
