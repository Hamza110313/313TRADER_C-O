import React from 'react';
import { LayoutGrid, SlidersHorizontal, ClipboardList, ShoppingBag } from 'lucide-react';
import { ActiveView } from '../types/commerce';

interface MobileBottomNavProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
}

export function MobileBottomNav({
  activeView,
  onNavigate,
  cartCount,
  cartSubtotal,
  onOpenCart,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E2E8F0] shadow-level-3 px-2 h-14 flex items-center justify-between gap-1"
    >
      <button
        type="button"
        onClick={() => onNavigate('catalog')}
        className={`flex-1 h-11 flex flex-col items-center justify-center gap-0.5 rounded text-[11px] font-semibold transition-colors ${
          activeView === 'catalog' || activeView === 'product'
            ? 'text-[#0369A1]'
            : 'text-[#64748B]'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="whitespace-nowrap">Catalog</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('spec-search')}
        className={`flex-1 h-11 flex flex-col items-center justify-center gap-0.5 rounded text-[11px] font-semibold transition-colors ${
          activeView === 'spec-search' ? 'text-[#0369A1]' : 'text-[#64748B]'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="whitespace-nowrap">Spec Search</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('orders')}
        className={`flex-1 h-11 flex flex-col items-center justify-center gap-0.5 rounded text-[11px] font-semibold transition-colors ${
          activeView === 'orders' ? 'text-[#0369A1]' : 'text-[#64748B]'
        }`}
      >
        <ClipboardList className="w-4 h-4" />
        <span className="whitespace-nowrap">Orders</span>
      </button>

      <button
        type="button"
        onClick={onOpenCart}
        className="h-10 px-3 rounded bg-[#0369A1] text-white inline-flex items-center gap-2 shrink-0 text-[12px] font-bold"
      >
        <ShoppingBag className="w-4 h-4" />
        <span className="tabular-nums whitespace-nowrap">
          {cartCount > 0 ? `Rs ${cartSubtotal.toLocaleString('en-US')}` : 'Cart'}
        </span>
        {cartCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#E11D48] text-white text-[10px] font-extrabold tabular-nums">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
