import type { ReactNode } from 'react';

interface SectionHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  eyebrow?: string;
  gradient?: boolean;
  align?: 'left' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SectionHeadingProps['size']>, string> = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-7xl',
};

export default function SectionHeading({
  as = 'h2',
  eyebrow,
  gradient = false,
  align = 'left',
  size = 'md',
  children,
  subtitle,
  className = '',
}: SectionHeadingProps) {
  const Tag = as;
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const gradientClass = gradient
    ? 'bg-gradient-to-r from-[var(--climate-teal)] via-[var(--sanitation-blue)] to-[var(--poverty-earth)] bg-clip-text text-transparent'
    : '';

  return (
    <div className={`${alignClass} ${className}`}>
      {eyebrow && (
        <div className="text-xs md:text-sm font-semibold tracking-[0.18em] uppercase text-[var(--climate-teal)] mb-3">
          {eyebrow}
        </div>
      )}
      <Tag className={`font-bold ${SIZE_CLASSES[size]} ${gradientClass}`}>
        {children}
      </Tag>
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-3xl mx-auto font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}
