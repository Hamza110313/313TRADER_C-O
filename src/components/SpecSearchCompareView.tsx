import React, { useMemo, useState } from 'react';
import { Check, GitCompareArrows, Search, ShoppingBag, X } from 'lucide-react';
import { calcMemberPrice, CATEGORIES, MEMBERSHIP_DISCOUNT_PCT, PRODUCTS } from '../data/products';
import { CategoryId, Product } from '../types/commerce';
import { HardwareImage, PriceDisplay } from './ui';

interface SpecSearchCompareViewProps {
  compareIds: string[];
  isMember?: boolean;
  onToggleCompare: (productId: string) => void;
  onClearCompare: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (productId: string, variantId: string) => void;
}

export function SpecSearchCompareView({
  compareIds,
  isMember = false,
  onToggleCompare,
  onClearCompare,
  onSelectProduct,
  onAddToCart,
}: SpecSearchCompareViewProps) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId>('all');
  const [voltageFilter, setVoltageFilter] = useState<string>('all');
  const [enclosureFilter, setEnclosureFilter] = useState<string>('all');
  const [minEffFilter, setMinEffFilter] = useState<number>(0);

  const comparedProducts = useMemo(
    () =>
      compareIds
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [compareIds]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (voltageFilter !== 'all' && p.voltageBus !== voltageFilter) return false;
      if (enclosureFilter !== 'all' && p.enclosureRating !== enclosureFilter) return false;
      if (p.efficiencyPct < minEffFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q)) ||
        p.specs.some(
          (s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
        )
      );
    });
  }, [query, categoryFilter, voltageFilter, enclosureFilter, minEffFilter]);

  const voltageOptions = ['all', '48V / 51.2V', '400V HV', '24V', 'AC Coupled'];
  const enclosureOptions = ['all', 'IP65', 'IP67', 'IP20'];

  return (
    <div className="space-y-8">
      {/* Page Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A]">
            Parametric Spec Search & Comparison
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Filter hardware by DC bus voltage, enclosure rating, and conversion efficiency, or pin
            up to 3 units for side-by-side specification matching.
          </p>
        </div>
        <div className="text-[13px] font-semibold text-[#64748B] tabular-nums whitespace-nowrap">
          {filteredProducts.length} of {PRODUCTS.length} hardware units
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <section
        aria-label="Hardware Comparison Matrix"
        className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-level-1 overflow-hidden"
      >
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-[#0369A1]" />
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              Side-by-Side Comparison ({comparedProducts.length}/3)
            </h2>
          </div>
          {comparedProducts.length > 0 && (
            <button
              type="button"
              onClick={onClearCompare}
              className="text-[12px] font-semibold text-[#64748B] hover:text-[#E11D48] transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {comparedProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[14px] font-medium text-[#475569]">
              No hardware pinned for comparison yet. Click Compare on any unit below to inspect
              electrical metrics side by side.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FFFFFF]">
                  <th className="w-[210px] p-4 align-bottom spec-label text-[#64748B]">
                    PARAMETER
                  </th>
                  {comparedProducts.map((item) => {
                    const v = item.variants[0];
                    return (
                      <th key={item.id} className="p-4 align-top border-l border-[#F1F5F9]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <HardwareImage
                              src={item.image}
                              alt={item.name}
                              containerClassName="w-12 h-12 rounded border border-[#E2E8F0] shrink-0"
                            />
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onSelectProduct(item.id)}
                                className="text-left text-[13px] font-bold text-[#0F172A] hover:text-[#0369A1] line-clamp-2 cursor-pointer"
                              >
                                {item.name}
                              </button>
                              <div className="text-[11px] font-medium text-[#64748B] tabular-nums">
                                {v.sku}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleCompare(item.id)}
                            aria-label={`Remove ${item.name} from comparison`}
                            className="p-1 text-[#64748B] hover:text-[#E11D48] rounded cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-2">
                          <div>
                            <PriceDisplay
                              amount={isMember ? calcMemberPrice(v.price) : v.price}
                              size="sm"
                            />
                            {isMember && (
                              <div className="text-[10px] font-bold text-[#047857] tabular-nums">
                                -{MEMBERSHIP_DISCOUNT_PCT}% Member
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddToCart(item.id, v.id)}
                            className="h-8 px-2.5 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[12px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {[
                  {
                    label: 'Unit Price Efficiency',
                    getValue: (p: Product) => p.variants[0].unitMetric,
                  },
                  {
                    label: 'Rated Power Output',
                    getValue: (p: Product) =>
                      `${p.variants[0].powerRatingWatts.toLocaleString('en-US')} W`,
                  },
                  {
                    label: 'DC Bus Architecture',
                    getValue: (p: Product) => p.voltageBus,
                  },
                  {
                    label: 'Peak Efficiency',
                    getValue: (p: Product) => `${p.efficiencyPct}%`,
                  },
                  {
                    label: 'Enclosure Rating',
                    getValue: (p: Product) => p.enclosureRating,
                  },
                  {
                    label: 'Unit Weight',
                    getValue: (p: Product) => `${p.variants[0].weightKg} kg`,
                  },
                  {
                    label: 'Warranty Coverage',
                    getValue: (p: Product) => `${p.warrantyYears} Years`,
                  },
                  {
                    label: 'Primary Certification',
                    getValue: (p: Product) => p.certifications[0] ?? 'UL Listed',
                  },
                ].map((row, idx) => (
                  <tr
                    key={row.label}
                    className={`h-[36px] ${idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC]'}`}
                  >
                    <td className="px-4 spec-label text-[#64748B]">{row.label}</td>
                    {comparedProducts.map((item) => (
                      <td
                        key={item.id}
                        className="px-4 border-l border-[#F1F5F9] spec-value text-[#0F172A]"
                      >
                        {row.getValue(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Parametric Filter Bar */}
      <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-4 sm:p-5 shadow-level-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <label htmlFor="spec-search-input" className="block spec-label text-[#64748B] mb-1.5">
              KEYWORD / SKU / ELECTRICAL SPEC
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="spec-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 12,000 W, UL 9540, 51.2V, ECL-H12K..."
                className="w-full h-10 pl-9 pr-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#0369A1] text-[14px] text-[#0F172A]"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="voltage-select" className="block spec-label text-[#64748B] mb-1.5">
              VOLTAGE BUS
            </label>
            <select
              id="voltage-select"
              value={voltageFilter}
              onChange={(e) => setVoltageFilter(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#0369A1] text-[14px] text-[#0F172A]"
            >
              {voltageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'all' ? 'All Voltage Buses' : opt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="enclosure-select" className="block spec-label text-[#64748B] mb-1.5">
              ENCLOSURE
            </label>
            <select
              id="enclosure-select"
              value={enclosureFilter}
              onChange={(e) => setEnclosureFilter(e.target.value)}
              className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#0369A1] text-[14px] text-[#0F172A]"
            >
              {enclosureOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'all' ? 'Any Rating' : opt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="eff-select" className="block spec-label text-[#64748B] mb-1.5">
              MIN EFFICIENCY
            </label>
            <select
              id="eff-select"
              value={minEffFilter}
              onChange={(e) => setMinEffFilter(Number(e.target.value))}
              className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#0369A1] text-[14px] text-[#0F172A]"
            >
              <option value={0}>Any Efficiency</option>
              <option value={95}>≥ 95% Conversion</option>
              <option value={98}>≥ 98% High-Eff</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? PRODUCTS.length
                : PRODUCTS.filter((p) => p.category === cat.id).length;
            const selected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`h-8 px-3.5 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[#0369A1] text-white border border-[#0369A1]'
                    : 'bg-[#FFFFFF] text-[#475569] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] tabular-nums ${
                    selected ? 'text-white/80' : 'text-[#64748B]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Parametric Results Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] h-10">
                <th className="px-4 spec-label text-[#64748B]">HARDWARE UNIT / SKU</th>
                <th className="px-4 spec-label text-[#64748B]">BUS</th>
                <th className="px-4 spec-label text-[#64748B]">RATED POWER</th>
                <th className="px-4 spec-label text-[#64748B]">EFFICIENCY</th>
                <th className="px-4 spec-label text-[#64748B]">PRICE</th>
                <th className="px-4 spec-label text-[#64748B] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[14px] text-[#475569]">
                    No hardware matches the current parametric filters. Reset filters to view all
                    stock.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const v = p.variants[0];
                  const isPinned = compareIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`h-[56px] ${idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC]'}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <HardwareImage
                            src={p.image}
                            alt={p.name}
                            containerClassName="w-10 h-10 rounded border border-[#E2E8F0] shrink-0"
                          />
                          <div>
                            <button
                              type="button"
                              onClick={() => onSelectProduct(p.id)}
                              className="text-left text-[14px] font-semibold text-[#0F172A] hover:text-[#0369A1] cursor-pointer"
                            >
                              {p.name}
                            </button>
                            <div className="text-[11px] text-[#64748B] tabular-nums">
                              {v.sku} · {p.enclosureRating}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 spec-value text-[#0F172A] whitespace-nowrap">
                        {p.voltageBus}
                      </td>
                      <td className="px-4 spec-value text-[#0F172A] whitespace-nowrap">
                        {v.powerRatingWatts.toLocaleString('en-US')} W
                      </td>
                      <td className="px-4 spec-value text-[#047857] whitespace-nowrap">
                        {p.efficiencyPct}%
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-2">
                          <PriceDisplay
                            amount={isMember ? calcMemberPrice(v.price) : v.price}
                            size="sm"
                          />
                          {isMember ? (
                            <span className="text-[11px] font-bold text-[#047857] tabular-nums">
                              (-{MEMBERSHIP_DISCOUNT_PCT}% Member)
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#64748B] tabular-nums">
                              ({v.unitMetric})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleCompare(p.id)}
                            className={`h-8 px-2.5 rounded border text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                              isPinned
                                ? 'bg-[#0369A1] border-[#0369A1] text-white'
                                : 'border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
                            }`}
                          >
                            {isPinned && <Check className="w-3.5 h-3.5" />}
                            <span>{isPinned ? 'Pinned' : 'Compare'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddToCart(p.id, v.id)}
                            className="h-8 px-3 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[12px] font-bold cursor-pointer transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
