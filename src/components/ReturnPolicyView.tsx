import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, MessageCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';

interface ReturnPolicyViewProps {
  onBackToCatalog: () => void;
  onGoToOrders: () => void;
}

export function ReturnPolicyView({ onBackToCatalog, onGoToOrders }: ReturnPolicyViewProps) {
  const [orderId, setOrderId] = useState('');
  const [sku, setSku] = useState('');
  const [reason, setReason] = useState('Unopened / Surplus Site Stock');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRma, setSubmittedRma] = useState<string | null>(null);

  const handleSubmitRma = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!orderId.trim()) nextErrors.orderId = 'Enter your VoltGrid Order ID (e.g. VG-2026-8419).';
    if (!sku.trim()) nextErrors.sku = 'Enter the hardware SKU being returned.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const rmaNumber = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;
    setErrors({});
    setSubmittedRma(rmaNumber);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hardware Catalog</span>
        </button>

        <button
          type="button"
          onClick={onGoToOrders}
          className="text-[13px] font-semibold text-[#0369A1] hover:underline cursor-pointer"
        >
          View Your Order Manifests →
        </button>
      </div>

      {/* Header Card */}
      <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-level-1 space-y-4">
        <div className="flex items-center gap-2.5 text-[#047857]">
          <RotateCcw className="w-5 h-5" />
          <span className="spec-label">90-DAY HARDWARE RETURN GUARANTEE</span>
        </div>

        <h1 className="text-[26px] sm:text-[34px] font-extrabold tracking-[-0.02em] text-[#0F172A] text-balance">
          90-Day Return & Zero-Friction Replacement Policy
        </h1>

        <p className="text-[14px] sm:text-[15px] leading-[23px] text-[#475569] max-w-[70ch]">
          Every inverter, LiFePO4 battery bank, solar module, DC fan, LED luminaire, and PV wiring
          kit supplied by VoltGrid Supply is protected by our 90-day engineering return policy from
          the date of freight delivery.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Policy Terms Specification Table + Conditions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-level-1">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#0F172A]">
                Return Policy Parameters
              </h2>
              <span className="spec-label text-[#64748B]">PKR BILLING COVERAGE</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {[
                { label: 'Eligible Return Window', value: '90 Calendar Days from Delivery' },
                { label: 'Unopened / Surplus Restock Fee', value: '0% Fee (Full PKR Refund)' },
                { label: 'Dead-on-Arrival (DOA) Swap', value: 'Priority 48h Replacement' },
                { label: 'LTL Return Freight (Defective)', value: '100% Covered by VoltGrid' },
                { label: 'PKR Refund Settlement', value: '3–5 Business Days (IBFT / Card)' },
                { label: 'Cut-to-Length PV Cable', value: 'Factory-Sealed Coils Only' },
                { label: 'Inspection Turnaround', value: '24 Hours at Lahore / ISB Hub' },
              ].map((row, idx) => (
                <div
                  key={row.label}
                  className={`h-[36px] px-5 flex items-center justify-between gap-4 ${
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

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 shadow-level-1 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0369A1]" />
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                Eligibility & Inspection Checklist
              </h3>
            </div>
            <ul className="space-y-2 text-[13px] text-[#475569] leading-[20px]">
              <li>
                1. Hardware must include original serial plate, terminal covers, and factory
                packaging foam/pallet strapping for non-defective returns.
              </li>
              <li>
                2. Inverters and LiFePO4 racks showing physical impact or improper reverse-polarity
                installation are routed under manufacturer warranty diagnostics instead of standard
                90-day return.
              </li>
              <li>
                3. Refunds are issued in PKR to the original IBFT bank account, corporate card, or
                Net-30 ledger credit within 3–5 business days after warehouse verification.
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Interactive RMA Return Request Form */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 sm:p-6 shadow-level-1 space-y-4">
          <h2 className="text-[17px] font-bold text-[#0F172A]">Request 90-Day Return (RMA)</h2>
          <p className="text-[13px] text-[#475569]">
            Submit your Order ID and SKU to generate an instant return authorization number or
            dispatch pickup on WhatsApp.
          </p>

          {submittedRma ? (
            <div className="p-4 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[14px] font-bold text-[#0F172A]">
                    Authorization Issued: {submittedRma}
                  </div>
                  <p className="text-[12px] text-[#065F46] mt-1">
                    Return request logged for Order #{orderId} ({sku}). Send your RMA code to our
                    dispatch desk to schedule courier or LTL pickup.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={buildWhatsAppUrl(
                    `Assalam-o-Alaikum VoltGrid Supply, I have generated 90-Day Return ${submittedRma} for Order #${orderId} (SKU: ${sku}, Reason: ${reason}). Please schedule pickup.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirm Pickup on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRma(null);
                    setOrderId('');
                    setSku('');
                    setNotes('');
                  }}
                  className="w-full h-9 rounded border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A] cursor-pointer"
                >
                  Submit Another Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRma} className="space-y-3.5" noValidate>
              <div>
                <label htmlFor="rma-order" className="block spec-label text-[#64748B] mb-1">
                  ORDER ID *
                </label>
                <input
                  id="rma-order"
                  type="text"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    if (errors.orderId) setErrors((p) => ({ ...p, orderId: '' }));
                  }}
                  placeholder="e.g. VG-2026-8419"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none tabular-nums ${
                    errors.orderId
                      ? 'border-[#E11D48]'
                      : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.orderId && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.orderId}</p>
                )}
              </div>

              <div>
                <label htmlFor="rma-sku" className="block spec-label text-[#64748B] mb-1">
                  HARDWARE SKU *
                </label>
                <input
                  id="rma-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    if (errors.sku) setErrors((p) => ({ ...p, sku: '' }));
                  }}
                  placeholder="e.g. ECL-H12K-SL01"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none tabular-nums ${
                    errors.sku ? 'border-[#E11D48]' : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.sku && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.sku}</p>
                )}
              </div>

              <div>
                <label htmlFor="rma-reason" className="block spec-label text-[#64748B] mb-1">
                  RETURN REASON
                </label>
                <select
                  id="rma-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none focus:border-[#0369A1]"
                >
                  <option value="Unopened / Surplus Site Stock">Unopened / Surplus Site Stock</option>
                  <option value="Dead on Arrival (DOA)">Dead on Arrival (DOA)</option>
                  <option value="Transit Packaging Damage">Transit Packaging Damage</option>
                  <option value="Wrong Voltage / Configuration">
                    Wrong Voltage / Configuration
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="rma-notes" className="block spec-label text-[#64748B] mb-1">
                  TECHNICAL NOTES (OPTIONAL)
                </label>
                <textarea
                  id="rma-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe fault code or site pickup instructions..."
                  className="w-full p-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[13px] focus:outline-none focus:border-[#0369A1]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 md:h-10 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold transition-colors cursor-pointer"
              >
                Generate 90-Day Return Authorization
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
