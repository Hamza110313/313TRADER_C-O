import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import { BadgeTone } from '../types/commerce';

export function formatPKR(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString('en-US')}`;
}

export function PriceDisplay({
  amount,
  size = 'card',
  className = '',
}: {
  amount: number;
  size?: 'card' | 'hero' | 'sm';
  className?: string;
}) {
  const formatted = Math.round(amount).toLocaleString('en-US');
  const sizeClass =
    size === 'hero'
      ? 'text-[30px] sm:text-[32px] leading-[36px] tracking-[-0.03em]'
      : size === 'card'
        ? 'text-[20px] sm:text-[22px] leading-[26px] tracking-[-0.02em]'
        : 'text-[15px] leading-[20px] tracking-[-0.01em]';

  return (
    <span className={`inline-flex items-start font-extrabold tabular-nums text-[#0F172A] ${sizeClass} ${className}`}>
      <span className="text-[0.72em] leading-[1.2] mr-1 font-bold tracking-normal">Rs</span>
      <span>{formatted}</span>
    </span>
  );
}

export function SemanticBadge({
  label,
  tone,
  className = '',
}: {
  label: string;
  tone: BadgeTone;
  className?: string;
}) {
  const styles: Record<BadgeTone, string> = {
    eco: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    yield: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    alert: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded border spec-label whitespace-nowrap ${styles[tone]} ${className}`}
    >
      {label}
    </span>
  );
}

export function HardwareImage({
  src,
  alt,
  className = '',
  containerClassName = '',
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F8FAFC] text-[#64748B] p-6 text-center ${containerClassName}`}
      >
        <Cpu className="w-10 h-10 text-[#0369A1] mb-2 stroke-[1.5]" />
        <span className="text-xs font-semibold text-[#475569] max-w-[180px] line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`bg-[#F8FAFC] overflow-hidden ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
  );
}

export function calcSavingsPct(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
