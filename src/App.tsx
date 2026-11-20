/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, GitCompareArrows, MessageCircle, Search, X } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MembershipView } from './components/MembershipView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OrdersView } from './components/OrdersView';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './components/ProductDetailView';
import { RegisterView } from './components/RegisterView';
import { ReturnPolicyView } from './components/ReturnPolicyView';
import { SpecSearchCompareView } from './components/SpecSearchCompareView';
import {
  buildWhatsAppUrl,
  calcMemberPrice,
  CATEGORIES,
  INITIAL_ORDERS,
  PRODUCTS,
  WHATSAPP_DISPLAY,
} from './data/products';
import {
  ActiveView,
  CartItem,
  CategoryId,
  MembershipCard,
  Order,
  UserAccount,
} from './types/commerce';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'power-desc';

const ACTIVE_USER_KEY = 'voltgrid_active_user';
const MEMBERSHIP_STORAGE_KEY = 'voltgrid_membership_card';

function loadSavedUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? (JSON.parse(raw) as UserAccount) : null;
  } catch {
    return null;
  }
}

function loadSavedMembership(): MembershipCard | null {
  try {
    const raw = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MembershipCard) : null;
  } catch {
    return null;
  }
}

interface ParsedRoute {
  view: ActiveView;
  productId: string;
  category: CategoryId;
}

function parseRouteFromLocation(): ParsedRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path.startsWith('/product/')) {
    const slug = decodeURIComponent(path.slice('/product/'.length));
    const found = PRODUCTS.find((p) => p.id === slug);
    if (found) {
      return { view: 'product', productId: found.id, category: found.category };
    }
  }
  if (path.startsWith('/category/')) {
    const catSlug = decodeURIComponent(path.slice('/category/'.length)) as CategoryId;
    if (CATEGORIES.some((c) => c.id === catSlug)) {
      return { view: 'catalog', productId: PRODUCTS[0].id, category: catSlug };
    }
  }
  const viewMap: Record<string, ActiveView> = {
    '/spec-search': 'spec-search',
    '/orders': 'orders',
    '/register': 'register',
    '/returns': 'returns',
    '/membership': 'membership',
  };
  if (viewMap[path]) {
    return { view: viewMap[path], productId: PRODUCTS[0].id, category: 'all' };
  }
  return { view: 'catalog', productId: PRODUCTS[0].id, category: 'all' };
}

function buildPathForRoute(view: ActiveView, productId: string, category: CategoryId): string {
  if (view === 'product') return `/product/${encodeURIComponent(productId)}`;
  if (view === 'catalog') {
    return category === 'all' ? '/' : `/category/${encodeURIComponent(category)}`;
  }
  return `/${view}`;
}

export default function App() {
  const initialRoute = useMemo(() => parseRouteFromLocation(), []);
  const [activeView, setActiveView] = useState<ActiveView>(initialRoute.view);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialRoute.productId);
  const [categoryFilter, setCategoryFilter] = useState<CategoryId>(initialRoute.category);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [compareIds, setCompareIds] = useState<string[]>(['eclipse-h12k', 'voltacon-15k-rack']);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 'eclipse-h12k', variantId: 'eclipse-12k-48v', quantity: 1 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadSavedUser());
  const [membership, setMembership] = useState<MembershipCard | null>(() => loadSavedMembership());

  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMember = Boolean(membership?.active);

  const cartStats = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of cartItems) {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (variant) {
        count += item.quantity;
        const unitPrice = isMember ? calcMemberPrice(variant.price) : variant.price;
        subtotal += unitPrice * item.quantity;
      }
    }
    return { count, subtotal };
  }, [cartItems, isMember]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q)) ||
        p.quickSpecs.some((s) => s.value.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.variants[0].price - b.variants[0].price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.variants[0].price - a.variants[0].price);
    }
    if (sortBy === 'power-desc') {
      return [...list].sort(
        (a, b) => b.variants[0].powerRatingWatts - a.variants[0].powerRatingWatts
      );
    }
    return list;
  }, [categoryFilter, searchQuery, sortBy]);

  const selectedProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === selectedProductId) ?? PRODUCTS[0],
    [selectedProductId]
  );

  useEffect(() => {
    const handlePopState = () => {
      const next = parseRouteFromLocation();
      setActiveView(next.view);
      setSelectedProductId(next.productId);
      setCategoryFilter(next.category);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (activeView === 'product') {
      document.title = `${selectedProduct.name} | VoltGrid Supply`;
    } else if (activeView === 'catalog' && categoryFilter !== 'all') {
      const catLabel = CATEGORIES.find((c) => c.id === categoryFilter)?.label ?? 'Catalog';
      document.title = `${catLabel} | VoltGrid Supply`;
    } else if (activeView === 'membership') {
      document.title = '1-Year Membership Card | VoltGrid Supply';
    } else if (activeView === 'spec-search') {
      document.title = 'Parametric Spec Search | VoltGrid Supply';
    } else if (activeView === 'orders') {
      document.title = 'Orders & Dispatch | VoltGrid Supply';
    } else if (activeView === 'returns') {
      document.title = '90-Day Return Policy | VoltGrid Supply';
    } else if (activeView === 'register') {
      document.title = 'Account & Registration | VoltGrid Supply';
    } else {
      document.title = 'VoltGrid Supply | Precision Solar, Battery & Inverter Hardware';
    }
  }, [activeView, selectedProduct, categoryFilter]);

  const pushRoute = (view: ActiveView, productId: string, category: CategoryId) => {
    const nextPath = buildPathForRoute(view, productId, category);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
  };

  const handleNavigate = (view: ActiveView) => {
    const nextCategory = view === 'catalog' ? 'all' : categoryFilter;
    if (view === 'catalog') {
      setCategoryFilter('all');
    }
    setActiveView(view);
    pushRoute(view, selectedProductId, nextCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product');
    pushRoute('product', productId, categoryFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: CategoryId) => {
    setCategoryFilter(category);
    setActiveView('catalog');
    pushRoute('catalog', selectedProductId, category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (productId: string, variantId: string, quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId && i.variantId === variantId);
      if (idx >= 0) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { productId, variantId, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const handleToggleCompare = (productId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), productId];
      }
      return [...prev, productId];
    });
  };

  const handlePlaceOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setLatestOrderId(order.id);
    setCartItems([]);
    setIsCartOpen(false);
    setActiveView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    try {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(account));
    } catch {
      // ignore storage errors
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(ACTIVE_USER_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const handleActivateMembership = (card: MembershipCard) => {
    setMembership(card);
    try {
      localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(card));
    } catch {
      // ignore storage errors
    }
  };

  const handleCancelMembership = () => {
    setMembership(null);
    try {
      localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const handleFocusSearch = () => {
    if (activeView !== 'catalog') {
      setActiveView('catalog');
      window.setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      searchInputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        cartCount={cartStats.count}
        cartSubtotal={cartStats.subtotal}
        compareCount={compareIds.length}
        currentUser={currentUser}
        membership={membership}
        onOpenCart={() => setIsCartOpen(true)}
        onFocusSearch={handleFocusSearch}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeView === 'catalog' && (
          <div className="space-y-8 sm:space-y-10">
            {/* Hero Focal Anchor */}
            <HeroSection
              isMember={isMember}
              onInspectFlagship={handleSelectProduct}
              onOpenSpecSearch={() => handleNavigate('spec-search')}
            />

            {/* Integrated Search Header & Category Selector Pills */}
            <section aria-label="Hardware Catalog Filters" className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Integrated Search Input */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search combo deals, fridge, solar AC, inverters, LiFePO4, fans, wiring, or SKU..."
                    aria-label="Search hardware catalog"
                    className="w-full h-10 pl-10 pr-9 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#0369A1] text-[14px] text-[#0F172A] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort & Count Controls */}
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <span className="text-[13px] font-medium text-[#64748B] tabular-nums whitespace-nowrap">
                    {filteredCatalog.length} {filteredCatalog.length === 1 ? 'unit' : 'units'}
                  </span>

                  <div className="relative inline-flex items-center">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      aria-label="Sort hardware products"
                      className="h-10 pl-8 pr-3 rounded border border-[#E2E8F0] bg-[#FFFFFF] text-[13px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#0369A1] cursor-pointer"
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price-asc">Price (PKR): Low to High</option>
                      <option value="price-desc">Price (PKR): High to Low</option>
                      <option value="power-desc">Output Power: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Filter Chips (Permitted rounded-full pill exception) */}
              <div className="flex flex-wrap items-center gap-2">
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
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`h-9 px-4 rounded-full text-[13px] font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                        selected
                          ? 'bg-[#0369A1] text-white border border-[#0369A1]'
                          : 'bg-[#FFFFFF] text-[#475569] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[11px] font-bold tabular-nums ${
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

            {/* Product Grid: 4-up XL desktop, 3-up LG desktop, 2-up tablet, 1-up mobile */}
            <section aria-label="Power Hardware Catalog">
              {filteredCatalog.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-12 text-center shadow-level-1">
                  <p className="text-[16px] font-bold text-[#0F172A]">
                    No matching hardware found
                  </p>
                  <p className="text-[14px] text-[#64748B] mt-1">
                    Try clearing your search term or switching to All Hardware.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                    }}
                    className="mt-4 h-10 px-4 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Reset Catalog Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredCatalog.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isCompared={compareIds.includes(product.id)}
                      isMember={isMember}
                      onSelectProduct={handleSelectProduct}
                      onAddToCart={handleAddToCart}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Comparison Dock Banner (when items are pinned) */}
            {compareIds.length > 0 && (
              <section
                aria-label="Pinned Comparison Tray"
                className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg px-5 py-4 shadow-level-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <GitCompareArrows className="w-5 h-5 text-[#0369A1] shrink-0" />
                  <div>
                    <div className="text-[14px] font-bold text-[#0F172A]">
                      {compareIds.length} hardware {compareIds.length === 1 ? 'unit' : 'units'}{' '}
                      pinned for spec comparison
                    </div>
                    <div className="text-[12px] text-[#64748B]">
                      {compareIds
                        .map((id) => PRODUCTS.find((p) => p.id === id)?.name)
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCompareIds([])}
                    className="h-9 px-3 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[12px] font-semibold text-[#475569] cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('spec-search')}
                    className="h-9 px-4 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[13px] font-bold whitespace-nowrap cursor-pointer"
                  >
                    Open Comparison Matrix
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {activeView === 'product' && (
          <ProductDetailView
            key={selectedProduct.id}
            product={selectedProduct}
            isCompared={compareIds.includes(selectedProduct.id)}
            isMember={isMember}
            onBack={() => handleNavigate('catalog')}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
            onAddToCart={handleAddToCart}
            onToggleCompare={handleToggleCompare}
            onGoToCompare={() => handleNavigate('spec-search')}
            onOpenReturnPolicy={() => handleNavigate('returns')}
            onOpenMembership={() => handleNavigate('membership')}
          />
        )}

        {activeView === 'spec-search' && (
          <SpecSearchCompareView
            compareIds={compareIds}
            isMember={isMember}
            onToggleCompare={handleToggleCompare}
            onClearCompare={() => setCompareIds([])}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            latestOrderId={latestOrderId}
            onSelectProduct={handleSelectProduct}
            onBackToCatalog={() => handleNavigate('catalog')}
            onOpenReturnPolicy={() => handleNavigate('returns')}
          />
        )}

        {activeView === 'register' && (
          <RegisterView
            currentUser={currentUser}
            onRegisterSuccess={handleRegisterSuccess}
            onSignOut={handleSignOut}
            onGoToCatalog={() => handleNavigate('catalog')}
            onGoToOrders={() => handleNavigate('orders')}
          />
        )}

        {activeView === 'returns' && (
          <ReturnPolicyView
            onBackToCatalog={() => handleNavigate('catalog')}
            onGoToOrders={() => handleNavigate('orders')}
          />
        )}

        {activeView === 'membership' && (
          <MembershipView
            membership={membership}
            currentUser={currentUser}
            onActivateMembership={handleActivateMembership}
            onCancelMembership={handleCancelMembership}
            onGoToCatalog={() => handleNavigate('catalog')}
          />
        )}
      </main>

      {/* Quiet Engineering Footer */}
      <footer className="hidden md:block border-t border-[#E2E8F0] bg-[#FFFFFF]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#64748B]">
          <div>
            © {new Date().getFullYear()} VoltGrid Supply. All prices in PKR. UL 1741 SA · UL 9540 ·
            IEEE 1547 Compliant Hardware.
          </div>
          <div className="flex items-center gap-6 font-semibold text-[#475569]">
            <button
              type="button"
              onClick={() => handleNavigate('catalog')}
              className="hover:text-[#0F172A] cursor-pointer"
            >
              Hardware Catalog
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('spec-search')}
              className="hover:text-[#0F172A] cursor-pointer"
            >
              Spec Comparison
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('membership')}
              className="hover:text-[#0F172A] cursor-pointer"
            >
              1-Yr Membership
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('returns')}
              className="hover:text-[#0F172A] cursor-pointer"
            >
              90-Day Return Policy
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('register')}
              className="hover:text-[#0F172A] cursor-pointer"
            >
              {currentUser ? 'Account Profile' : 'Register'}
            </button>
            <a
              href={buildWhatsAppUrl(
                'Assalam-o-Alaikum VoltGrid Supply, I have a hardware sizing inquiry.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#047857] hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp {WHATSAPP_DISPLAY}</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick-Inquiry Button (Permitted rounded-full FAB exception) */}
      <a
        href={buildWhatsAppUrl(
          'Assalam-o-Alaikum VoltGrid Supply, I would like a PKR quotation and sizing advice.'
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-[68px] md:bottom-6 right-4 sm:right-6 z-40 h-11 px-4 rounded-full bg-[#10B981] hover:bg-[#059669] text-white shadow-level-3 inline-flex items-center gap-2 text-[13px] font-bold transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2"
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        <span className="whitespace-nowrap">WhatsApp</span>
      </a>

      <MobileBottomNav
        activeView={activeView}
        onNavigate={handleNavigate}
        cartCount={cartStats.count}
        cartSubtotal={cartStats.subtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currentUser={currentUser}
        membership={membership}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
        onOpenReturnPolicy={() => handleNavigate('returns')}
        onOpenMembership={() => {
          setIsCartOpen(false);
          handleNavigate('membership');
        }}
      />
    </div>
  );
}
