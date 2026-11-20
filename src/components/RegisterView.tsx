import React, { useState } from 'react';
import { Building2, CheckCircle2, LogOut, MessageCircle, ShieldCheck, User, UserPlus } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';
import { UserAccount } from '../types/commerce';

interface RegisterViewProps {
  currentUser: UserAccount | null;
  onRegisterSuccess: (account: UserAccount) => void;
  onSignOut: () => void;
  onGoToCatalog: () => void;
  onGoToOrders: () => void;
}

const CITIES = [
  'Lahore, Punjab',
  'Karachi, Sindh',
  'Islamabad, ICT',
  'Rawalpindi, Punjab',
  'Faisalabad, Punjab',
  'Multan, Punjab',
  'Peshawar, KP',
  'Quetta, Balochistan',
];

export function RegisterView({
  currentUser,
  onRegisterSuccess,
  onSignOut,
  onGoToCatalog,
  onGoToOrders,
}: RegisterViewProps) {
  const [authTab, setAuthTab] = useState<'register' | 'signin'>('register');
  const [accountType, setAccountType] = useState<'residential' | 'commercial'>('residential');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ntnNumber, setNtnNumber] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sign-In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (currentUser) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
          <div>
            <h1 className="text-[18px] font-bold text-[#0F172A]">
              Active Account: {currentUser.fullName}
            </h1>
            <p className="text-[13px] text-[#065F46] mt-0.5">
              Your profile details and delivery address are synced for fast checkout and WhatsApp
              engineering dispatch.
            </p>
          </div>
        </div>

        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-level-1 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#0369A1]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">Account & Dispatch Profile</h2>
            </div>
            <span className="spec-label text-[#0369A1]">
              {currentUser.accountType === 'commercial'
                ? 'COMMERCIAL / INSTALLER'
                : 'RESIDENTIAL BUYER'}
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {[
              { label: 'Full Name', value: currentUser.fullName },
              { label: 'Email Address', value: currentUser.email },
              { label: 'WhatsApp / Mobile', value: currentUser.phone },
              ...(currentUser.companyName
                ? [{ label: 'Company / Firm', value: currentUser.companyName }]
                : []),
              ...(currentUser.ntnNumber
                ? [{ label: 'NTN / Tax Reference', value: currentUser.ntnNumber }]
                : []),
              { label: 'City / Region', value: currentUser.city },
              { label: 'Delivery Street', value: currentUser.address },
              { label: 'Registered Since', value: currentUser.createdAt },
            ].map((row, idx) => (
              <div
                key={row.label}
                className={`h-[36px] px-5 flex items-center justify-between gap-4 ${
                  idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC]'
                }`}
              >
                <span className="spec-label text-[#64748B]">{row.label}</span>
                <span className="spec-value text-[#0F172A] text-right truncate">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onGoToCatalog}
                className="h-10 px-4 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[13px] font-bold cursor-pointer"
              >
                Browse Hardware Catalog
              </button>
              <button
                type="button"
                onClick={onGoToOrders}
                className="h-10 px-4 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[13px] font-semibold text-[#0F172A] cursor-pointer"
              >
                View Orders
              </button>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="h-10 px-3.5 rounded border border-[#FECDD3] bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[13px] font-semibold text-[#E11D48] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (!phone.trim() || phone.trim().length < 10)
      nextErrors.phone = 'Enter a valid WhatsApp / mobile number (e.g. +92 300 1234567).';
    if (accountType === 'commercial' && !companyName.trim())
      nextErrors.companyName = 'Company or installer firm name is required for trade accounts.';
    if (!address.trim()) nextErrors.address = 'Delivery street address is required.';
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newAccount: UserAccount = {
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      accountType,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      companyName: accountType === 'commercial' ? companyName.trim() : undefined,
      ntnNumber: accountType === 'commercial' && ntnNumber.trim() ? ntnNumber.trim() : undefined,
      city,
      address: address.trim(),
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    try {
      localStorage.setItem(
        `voltgrid_pwd_${newAccount.email}`,
        JSON.stringify({ password, account: newAccount })
      );
    } catch {
      // ignore storage quota issues
    }

    setErrors({});
    onRegisterSuccess(newAccount);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const normalizedEmail = loginEmail.trim().toLowerCase();
    if (!normalizedEmail || !loginPassword) {
      setLoginError('Enter both your registered email and password.');
      return;
    }

    try {
      const saved = localStorage.getItem(`voltgrid_pwd_${normalizedEmail}`);
      if (!saved) {
        setLoginError('No account found for this email. Switch to Create Account to register.');
        return;
      }
      const parsed = JSON.parse(saved) as { password: string; account: UserAccount };
      if (parsed.password !== loginPassword) {
        setLoginError('Incorrect password. Please check your credentials.');
        return;
      }
      onRegisterSuccess(parsed.account);
    } catch {
      setLoginError('Unable to verify credentials. Please create a new account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Registration / Sign-In Form Card */}
      <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-level-1 overflow-hidden">
        {/* Segmented Auth Mode Tabs */}
        <div className="grid grid-cols-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <button
            type="button"
            onClick={() => setAuthTab('register')}
            className={`h-12 text-[14px] font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              authTab === 'register'
                ? 'bg-[#FFFFFF] text-[#0369A1] border-[#0369A1]'
                : 'text-[#64748B] border-transparent hover:text-[#0F172A]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signin')}
            className={`h-12 text-[14px] font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              authTab === 'signin'
                ? 'bg-[#FFFFFF] text-[#0369A1] border-[#0369A1]'
                : 'text-[#64748B] border-transparent hover:text-[#0F172A]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        {authTab === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4" noValidate>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A]">
                Register Energy Procurement Account
              </h1>
              <p className="text-[13px] text-[#475569] mt-0.5">
                Save site delivery coordinates, access PKR trade pricing, and sync WhatsApp order
                alerts.
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setAccountType('residential')}
                className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                  accountType === 'residential'
                    ? 'border-[#0369A1] bg-[#F0F9FF] text-[#0F172A]'
                    : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2 text-[13px] font-bold">
                  <User className="w-4 h-4 text-[#0369A1]" />
                  <span>Residential Buyer</span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Home solar & backup units</div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('commercial')}
                className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                  accountType === 'commercial'
                    ? 'border-[#0369A1] bg-[#F0F9FF] text-[#0F172A]'
                    : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2 text-[13px] font-bold">
                  <Building2 className="w-4 h-4 text-[#0369A1]" />
                  <span>Installer / Trade</span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Net-30 & pallet freight</div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="reg-name" className="block spec-label text-[#64748B] mb-1">
                  FULL NAME *
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                  }}
                  placeholder="Bilal Ahmed"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                    errors.fullName
                      ? 'border-[#E11D48]'
                      : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-phone" className="block spec-label text-[#64748B] mb-1">
                  WHATSAPP / MOBILE *
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  placeholder="+92 300 1234567"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none tabular-nums ${
                    errors.phone ? 'border-[#E11D48]' : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block spec-label text-[#64748B] mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="engineer@company.pk"
                className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                  errors.email ? 'border-[#E11D48]' : 'border-[#CBD5E1] focus:border-[#0369A1]'
                }`}
              />
              {errors.email && (
                <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.email}</p>
              )}
            </div>

            {accountType === 'commercial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-company" className="block spec-label text-[#64748B] mb-1">
                    COMPANY / EPC FIRM *
                  </label>
                  <input
                    id="reg-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (errors.companyName) setErrors((p) => ({ ...p, companyName: '' }));
                    }}
                    placeholder="Indus Solar Solutions"
                    className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                      errors.companyName
                        ? 'border-[#E11D48]'
                        : 'border-[#CBD5E1] focus:border-[#0369A1]'
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-[12px] font-medium text-[#E11D48] mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-ntn" className="block spec-label text-[#64748B] mb-1">
                    NTN NUMBER (OPTIONAL)
                  </label>
                  <input
                    id="reg-ntn"
                    type="text"
                    value={ntnNumber}
                    onChange={(e) => setNtnNumber(e.target.value)}
                    placeholder="e.g. 42101-889210-1"
                    className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none focus:border-[#0369A1] tabular-nums"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="reg-city" className="block spec-label text-[#64748B] mb-1">
                  CITY / REGION
                </label>
                <select
                  id="reg-city"
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

              <div>
                <label htmlFor="reg-address" className="block spec-label text-[#64748B] mb-1">
                  STREET / SITE ADDRESS *
                </label>
                <input
                  id="reg-address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((p) => ({ ...p, address: '' }));
                  }}
                  placeholder="Plot 14, DHA Phase 6"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                    errors.address
                      ? 'border-[#E11D48]'
                      : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.address && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="reg-pass" className="block spec-label text-[#64748B] mb-1">
                  PASSWORD *
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder="Min 6 characters"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                    errors.password
                      ? 'border-[#E11D48]'
                      : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.password && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block spec-label text-[#64748B] mb-1">
                  CONFIRM PASSWORD *
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  placeholder="Re-enter password"
                  className={`w-full h-10 px-3 rounded border bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none ${
                    errors.confirmPassword
                      ? 'border-[#E11D48]'
                      : 'border-[#CBD5E1] focus:border-[#0369A1]'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-[12px] font-medium text-[#E11D48] mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 md:h-10 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold transition-colors cursor-pointer"
            >
              Complete Registration
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignInSubmit} className="p-6 space-y-4" noValidate>
            <div>
              <h1 className="text-[22px] font-bold text-[#0F172A]">Sign In to VoltGrid Supply</h1>
              <p className="text-[13px] text-[#475569] mt-0.5">
                Access saved delivery profiles, PKR invoices, and active freight manifests.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded border border-[#FECDD3] bg-[#FFF1F2] text-[13px] font-medium text-[#E11D48]">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block spec-label text-[#64748B] mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="engineer@company.pk"
                className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none focus:border-[#0369A1]"
              />
            </div>

            <div>
              <label htmlFor="login-pass" className="block spec-label text-[#64748B] mb-1">
                PASSWORD *
              </label>
              <input
                id="login-pass"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10 px-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[14px] focus:outline-none focus:border-[#0369A1]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 md:h-10 rounded bg-[#0369A1] hover:bg-[#075985] text-white text-[14px] font-bold transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>
        )}
      </div>

      {/* Right: Account Benefits & WhatsApp Engineering Desk */}
      <aside className="lg:col-span-5 space-y-4">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 shadow-level-1 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              Trade & Procurement Benefits
            </h2>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {[
              { label: 'Currency Billing', value: 'PKR (Zero FX Surprises)' },
              { label: 'Free Freight Tier', value: 'Orders ≥ Rs 500,000' },
              { label: 'Return Window', value: '90 Days (0% DOA Fee)' },
              { label: 'EPC / Installer Terms', value: 'Net-30 & NTN Invoicing' },
              { label: 'Dispatch Coverage', value: 'Lahore · Karachi · Islamabad' },
            ].map((row, idx) => (
              <div
                key={row.label}
                className={`h-[36px] flex items-center justify-between gap-2 ${
                  idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC] px-2 -mx-2 rounded'
                }`}
              >
                <span className="spec-label text-[#64748B]">{row.label}</span>
                <span className="spec-value text-[#0F172A]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 shadow-level-1 space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              Need Bulk EPC Registration?
            </h2>
          </div>
          <p className="text-[13px] text-[#475569] leading-[20px]">
            Connect directly with our Islamabad & Lahore distribution desk on WhatsApp for dealer
            tier activation and pallet quotes in PKR.
          </p>
          <a
            href={buildWhatsAppUrl(
              'Assalam-o-Alaikum VoltGrid Supply, I would like to register a commercial solar dealer account.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 px-4 rounded bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message Sales Desk on WhatsApp</span>
          </a>
        </div>
      </aside>
    </div>
  );
}
