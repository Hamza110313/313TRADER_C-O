import React from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { calcMemberPrice, HERO_SYSTEM, MEMBERSHIP_DISCOUNT_PCT } from '../data/products';
import { HardwareImage, PriceDisplay, SemanticBadge } from './ui';

interface HeroSectionProps {
  isMember?: boolean;
  onInspectFlagship: (productId: string) => void;
  onOpenSpecSearch: () => void;
}

export function HeroSection({
  isMember = false,
  onInspectFlagship,
  onOpenSpecSearch,
}: HeroSectionProps) {
  const displayPrice = isMember ? calcMemberPrice(HERO_SYSTEM.price) : HERO_SYSTEM.price;
  return (
    <section
      aria-label="Featured Energy Storage Architecture"
      className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-level-1 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left: Engineering Copy & Pricing Lockup */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <SemanticBadge label="FLAGSHIP ARCHITECTURE · UL 9540" tone="eco" />
              <span className="text-[12px] font-medium text-[#64748B] tabular-nums">
                SKU ECL-H12K-BDL
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#0F172A] text-balance">
              {HERO_SYSTEM.title}
            </h1>

            <p className="text-[14px] sm:text-[15px] leading-[22px] text-[#475569] max-w-[54ch]">
              {HERO_SYSTEM.subtitle}
            </p>
          </div>

          <div className="space-y-5 pt-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <PriceDisplay amount={displayPrice} size="hero" />
              <span className="text-[15px] text-[#64748B] line-through tabular-nums">
                Rs {(isMember ? HERO_SYSTEM.price : HERO_SYSTEM.originalPrice).toLocaleString('en-US')}
              </span>
              <span
                className={`text-[13px] font-bold tabular-nums ${
                  isMember ? 'text-[#047857]' : 'text-[#E11D48]'
                }`}
              >
                {isMember
                  ? `${MEMBERSHIP_DISCOUNT_PCT}% Member Rate · ${HERO_SYSTEM.unitMetric}`
                  : `Save 13% · ${HERO_SYSTEM.unitMetric}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onInspectFlagship(HERO_SYSTEM.productId)}
                className="h-12 md:h-10 px-5 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2"
              >
                <span>Inspect System Specs</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenSpecSearch}
                className="h-12 md:h-10 px-4 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] text-[14px] font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#475569]" />
                <span>Parametric Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Architectural Installation Photography */}
        <div className="lg:col-span-6 relative min-h-[240px] sm:min-h-[320px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-[#E2E8F0]">
          <HardwareImage
            src={HERO_SYSTEM.image}
            alt="Eclipse 12K Hybrid Solar Inverter and Modular LiFePO4 Battery Stack Installation"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom 4-Column Engineering Proof Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0] bg-[#F8FAFC] divide-y lg:divide-y-0 divide-x divide-[#E2E8F0]">
        {HERO_SYSTEM.highlights.map((item) => (
          <div key={item.label} className="px-5 py-3.5 flex items-center justify-between gap-2">
            <span className="spec-label text-[#64748B]">{item.label}</span>
            <span className="spec-value text-[13px] text-[#0F172A]">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
