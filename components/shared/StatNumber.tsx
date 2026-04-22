import type { ReactNode } from 'react';

interface StatNumberProps {
  value: ReactNode;
  label: ReactNode;
  sublabel?: ReactNode;
  accent?: 'climate' | 'sanitation' | 'poverty' | 'danger' | 'warning' | 'success' | 'neutral';
  size?: 'md' | 'lg' | 'xl';
  align?: 'left' | 'center';
  icon?: ReactNode;
}

const VALUE_SIZE: Record<NonNullable<StatNumberProps['size']>, string> = {
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
};

const ACCENT_TEXT: Record<NonNullable<StatNumberProps['accent']>, string> = {
  climate: 'text-[var(--climate-teal)]',
  sanitation: 'text-[var(--sanitation-blue)]',
  poverty: 'text-[var(--poverty-earth)]',
  danger: 'text-[var(--accent-danger)]',
  warning: 'text-[var(--accent-warning)]',
  success: 'text-[var(--accent-success)]',
  neutral: 'text-gray-900',
};

export default function StatNumber({
  value,
  label,
  sublabel,
  accent = 'neutral',
  size = 'lg',
  align = 'left',
  icon,
}: StatNumberProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  return (
    <div className={`flex flex-col gap-1 ${alignClass}`}>
      {icon && <div className={`mb-1 ${ACCENT_TEXT[accent]}`}>{icon}</div>}
      <div className={`font-bold tabular-nums leading-none ${VALUE_SIZE[size]} ${ACCENT_TEXT[accent]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
    </div>
  );
}
