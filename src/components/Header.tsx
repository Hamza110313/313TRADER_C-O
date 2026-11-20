import React from 'react';
import { Award, ShoppingBag, Search, UserCheck, UserPlus } from 'lucide-react';
import { ActiveView, MembershipCard, UserAccount } from '../types/commerce';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartCount: number;
  cartSubtotal: number;
  compareCount: number;
  currentUser: UserAccount | null;
  membership: MembershipCard | null;
  onOpenCart: () => void;
  onFocusSearch: () => void;
}

export function Header({
  activeView,
  onNavigate,
  cartCount,
  cartSubtotal,
  compareCount,
  currentUser,
  membership,
  onOpenCart,
  onFocusSearch,
}: HeaderProps) {
  const navItems: { id: ActiveView; label: string }[] = [
    { id: 'catalog', label: 'Catalog' },
    { id: 'membership', label: membership?.active ? '1-Yr Member' : 'Membership' },
    { id: 'returns', label: '90-Day Returns' },
    { id: 'orders', label: 'Orders' },
    { id: 'register', label: currentUser ? currentUser.fullName.split(' ')[0] : 'Register' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className="text-[18px] sm:text-[20px] font-extrabold tracking-[-0.02em] text-[#0F172A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded px-1 -ml-1 cursor-pointer"
        >
          VoltGrid Supply
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const isActive =
              activeView === item.id ||
              (item.id === 'catalog' && activeView === 'product') ||
              (item.id === 'catalog' && activeView === 'spec-search' && compareCount < 0);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 text-[14px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded ${
                  isActive ? 'text-[#0369A1]' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0369A1]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action (Cart with Rose-600 counter) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onFocusSearch}
            aria-label="Search hardware catalog"
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('membership')}
            aria-label="1-Year Membership Card"
            className={`md:hidden w-10 h-10 inline-flex items-center justify-center rounded border transition-colors cursor-pointer ${
              activeView === 'membership' || membership?.active
                ? 'border-[#0369A1] bg-[#F0F9FF] text-[#0369A1]'
                : 'border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <Award className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('register')}
            aria-label={currentUser ? 'Account profile' : 'Register or sign in'}
            className={`md:hidden h-10 px-2.5 inline-flex items-center justify-center gap-1.5 rounded border text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeView === 'register'
                ? 'border-[#0369A1] bg-[#F0F9FF] text-[#0369A1]'
                : 'border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            {currentUser ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{currentUser ? currentUser.fullName.split(' ')[0] : 'Register'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open cart, ${cartCount} items`}
            className="h-10 px-3.5 rounded bg-[#0369A1] hover:bg-[#075985] text-white inline-flex items-center gap-2.5 text-[13px] font-bold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2"
          >
            <span className="relative inline-flex items-center">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#E11D48] text-white text-[11px] font-extrabold tabular-nums leading-none">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline tabular-nums">
              {cartCount > 0 ? `Rs ${cartSubtotal.toLocaleString('en-US')}` : 'Cart'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
