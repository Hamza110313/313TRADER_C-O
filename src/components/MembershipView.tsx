import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  MEMBERSHIP_ANNUAL_FEE,
  MEMBERSHIP_DISCOUNT_PCT,
} from '../data/products';
import { MembershipCard, UserAccount } from '../types/commerce';

interface MembershipViewProps {
  membership: MembershipCard | null;
  currentUser: UserAccount | null;
  onActivateMembership: (card: MembershipCard) => void;
  onCancelMembership: () => void;
  onGoToCatalog: () => void;
}

const CITIES = [
  'Lahore, Punjab',
  'Karachi, Sindh',
  'Islamabad, ICT',
  'Rawalpindi, Punjab',
  'Faisalabad, Punjab',
  'Multan, Punjab',
  'Peshawar, KP',
];

export function MembershipView({
  membership,
  currentUser,
  onActivateMembership,
  onCancelMembership,
  onGoToCatalog,
}: MembershipViewProps) {
  const [holderName, setHolderName] = useState(currentUser?.fullName ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [city, setCity] = useState(currentUser?.city ?? CITIES[0]);
  const [paymentChannel, setPaymentChannel] = useState('JazzCash / Easypaisa');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(now.getFullYear() + 1);

  const previewIssued = now.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const previewExpires = oneYearLater.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!holderName.trim()) nextErrors.holderName = 'Enter full cardholder name.';
    if (!phone.trim() || phone.trim().length < 10)
      nextErrors.phone = 'Enter a valid Pakistani mobile / WhatsApp number.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const card: MembershipCard = {
      id: `VG-YR-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      holderName: holderName.trim(),
      phone: phone.trim(),
      city,
      tier: 'VoltGrid Annual Pass (1 Year)',
      annualFee: MEMBERSHIP_ANNUAL_FEE,
      discountPct: MEMBERSHIP_DISCOUNT_PCT,
      issuedAt: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      expiresAt: oneYearLater.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      active: true,
    };

    setErrors({});
    onActivateMembership(card);
  };

  const displayCard = membership;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#0369A1] mb-1.5">
            <Award className="w-4 h-4" />
            <span className="spec-label">1-YEAR ANNUAL MEMBERSHIP CARD</span>
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A]">
            VoltGrid Annual Pass — 365 Days Coverage
          </h1>
          <p className="text-[14px] text-[#475569] mt-1 max-w-[66ch]">
            Lock in an exclusive {MEMBERSHIP_DISCOUNT_PCT}% member-only discount on each product
            across inverters, batteries, solar panels, fridges, ACs, and combos for one full year —
            plus free nationwide LTL freight for Rs {MEMBERSHIP_ANNUAL_FEE.toLocaleString('en-US')} /
            year.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToCatalog}
          className="h-10 px-4 rounded border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[13px] font-semibold text-[#0F172A] whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Digital 1-Year Membership Card Preview & Benefits Table */}
        <div className="lg:col-span-6 space-y-6">
          {/* Precision Architectural 1-Year Membership Card */}
          <div className="rounded-xl bg-gradient-to-br from-[#0F172A] via-[#00507D] to-[#0369A1] text-white p-6 shadow-level-3 border border-[#0369A1]/40 flex flex-col justify-between min-h-[228px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#94CCFF]">
                  VOLTGRID SUPPLY · ANNUAL PASS
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em] mt-0.5">
                  1-Year Energy Member
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-[0.04em] uppercase ${
                  displayCard
                    ? 'bg-[#10B981] text-white'
                    : 'bg-white/15 text-[#CBE4FF] border border-white/20'
                }`}
              >
                {displayCard ? 'ACTIVE · 365 DAYS' : 'Rs 12,000 / YEAR'}
              </span>
            </div>

            <div className="my-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-[#CBE4FF]/80">
                  CARD ID
                </div>
                <div className="text-[17px] font-bold tracking-[0.06em] tabular-nums mt-0.5">
                  {displayCard ? displayCard.id : `VG-YR-${now.getFullYear()}-PREVIEW`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-[#CBE4FF]/80">
                  MEMBER DISCOUNT
                </div>
                <div className="text-[17px] font-extrabold text-[#FDE68A] tabular-nums mt-0.5">
                  {MEMBERSHIP_DISCOUNT_PCT}% OFF + FREE LTL
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-[#CBE4FF]/80">
                  CARDHOLDER
                </div>
                <div className="text-[15px] font-bold truncate mt-0.5">
                  {displayCard
                    ? displayCard.holderName
                    : holderName.trim() || 'Your Name Here'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-[#CBE4FF]/80">
                  VALID FOR 1 YEAR
                </div>
                <div className="text-[13px] font-semibold tabular-nums mt-0.5">
                  {displayCard
                    ? `${displayCard.issuedAt} – ${displayCard.expiresAt}`
                    : `${previewIssued} – ${previewExpires}`}
                </div>
              </div>
            </div>
          </div>

          {/* 36px-row Annual Membership Specification Table */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-level-1">
            <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#0F172A]">
                1-Year Membership Benefits
              </h2>
              <span className="spec-label text-[#0369A1]">Rs 12,000 / YEAR</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {[
                { label: 'Membership Validity', value: '1 Full Year (365 Days)' },
                { label: 'Annual Subscription Fee', value: 'Rs 12,000 (Inclusive of GST)' },
                {
                  label: 'Per-Product Member Discount',
                  value: `${MEMBERSHIP_DISCOUNT_PCT}% Off Each Product (Members Only)`,
                },
                { label: 'Nationwide LTL Freight', value: 'Rs 0 Free on Every Order' },
                { label: '90-Day Return Priority', value: 'Zero-Fee Express Pickup' },
                { label: 'Engineering Support', value: 'Priority WhatsApp Line' },
              ].map((row, idx) => (
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

        {/* Right: Activation / Active Card Management */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-6 shadow-level-1 space-y-5">
          {displayCard ? (
            <>
              <div className="p-4 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[15px] font-bold text-[#0F172A]">
                    1-Year Membership Card Active
                  </div>
                  <p className="text-[13px] text-[#065F46] mt-0.5">
                    Your {MEMBERSHIP_DISCOUNT_PCT}% member discount and Free LTL Freight are
                    automatically applied in your Order Cart through {displayCard.expiresAt}.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-lg overflow-hidden">
                {[
                  { label: 'Member ID', value: displayCard.id },
                  { label: 'Cardholder', value: displayCard.holderName },
                  { label: 'WhatsApp Number', value: displayCard.phone },
                  { label: 'Registered City', value: displayCard.city },
                  { label: 'Issued Date', value: displayCard.issuedAt },
                  { label: '1-Year Expiry Date', value: displayCard.expiresAt },
                ].map((row, idx) => (
                  <div
                    key={row.label}
                    className={`h-[36px] px-4 flex items-center justify-between gap-4 ${
                      idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="spec-label text-[#64748B]">{row.label}</span>
                    <span className="spec-value text-[#0F172A]">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onGoToCatalog}
                  className="flex-1 h-11 md:h-10 px-4 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold cursor-pointer"
                >
                  Shop With {MEMBERSHIP_DISCOUNT_PCT}% Member Discount
                </button>
                <a
                  href={buildWhatsAppUrl(
                    `Assalam-o-Alaikum VoltGrid Supply, my 1-Year Membership Card ID is ${displayCard.id} (${displayCard.holderName}). I need priority engineering assistance.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 md:h-10 px-4 rounded bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Priority WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onCancelMembership}
                className="text-[12px] font-semibold text-[#64748B] hover:text-[#E11D48] cursor-pointer"
              >
                Deactivate Membership Card
              </button>
            </>
          ) : (
            <form onSubmit={handleActivate} className="space-y-4" noValidate>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[19px] font-bold text-[#0F172A]">
                    Activate 1-Year Membership Card
                  </h2>
                  <span className="text-[18px] font-extrabold text-[#0369A1] tabular-nums">
                    Rs {MEMBERSHIP_ANNUAL_FEE.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-[13px] text-[#475569] mt-1">
                  Pays for itself after Rs 240,000 in annual hardware purchases. Instant 365-day
                  5% per-product member pricing across all solar, fridge, AC, and combo units.
                </p>
              </div>

              <div>
                <label htmlFor="mem-name" className="block spec-label text-[#64748B] mb-1">
                  CARDHOLDER FULL NAME *
                </label>
                <input
                  id="mem-name"
                  type="text"
                  value={holderName}
                  onChange={(e) => {
                    setHolderName(e.target.value);
                    if (errors.holderName) setErrors((p) => ({ ...p, holderName: '' }));
                  }}
                  placeholder="e.g., Hamza Tariq"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                    errors.holderName
                      ? 'border-[#E11D48]'
                      : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.holderName && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.holderName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="mem-phone" className="block spec-label text-[#64748B] mb-1">
                    WHATSAPP NUMBER *
                  </label>
                  <input
                    id="mem-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                    }}
                    placeholder="+92 300 1234567"
                    className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none tabular-nums ${
                      errors.phone
                        ? 'border-[#E11D48]'
                        : 'border-[#CBD5E1] focus:border-[#0369A1]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mem-city" className="block spec-label text-[#64748B] mb-1">
                    CITY / REGION
                  </label>
                  <select
                    id="mem-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none focus:border-[#0369A1]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="mem-pay" className="block spec-label text-[#64748B] mb-1">
                  ANNUAL PAYMENT METHOD
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="mem-pay"
                    value={paymentChannel}
                    onChange={(e) => setPaymentChannel(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none focus:border-[#0369A1]"
                  >
                    <option value="JazzCash / Easypaisa">JazzCash / Easypaisa</option>
                    <option value="IBFT / Bank Transfer">IBFT / Bank Transfer</option>
                    <option value="Corporate / Debit Card">Corporate / Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5 text-[12px] text-[#475569]">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  1-Year Membership Fee: <strong className="text-[#0F172A]">Rs 12,000</strong>{' '}
                  (Valid {previewIssued} – {previewExpires})
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-12 md:h-10 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activate 1-Year Membership Card · Rs 12,000</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
