interface BrandMarkProps {
  size?: number;
  className?: string;
  variant?: 'color' | 'mono' | 'inverted';
}

export default function BrandMark({ size = 28, className = '', variant = 'color' }: BrandMarkProps) {
  const palette =
    variant === 'mono'
      ? { a: '#0f5a66', b: '#0f1d2f', c: '#5c4a38', stroke: '#062b30' }
      : variant === 'inverted'
      ? { a: '#2ca3b5', b: '#2d5a8f', c: '#a89176', stroke: '#ffffff' }
      : { a: '#1a7f8e', b: '#1e3a5f', c: '#8b7355', stroke: '#062b30' };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id="bm-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.6" stdDeviation="0.4" floodOpacity="0.15" />
        </filter>
      </defs>
      <g filter="url(#bm-shadow)" style={{ mixBlendMode: 'multiply' }}>
        {/* Climate */}
        <circle cx="14.5" cy="15" r="9" fill={palette.a} fillOpacity="0.85" />
        {/* Sanitation */}
        <circle cx="25.5" cy="15" r="9" fill={palette.b} fillOpacity="0.85" />
        {/* Poverty */}
        <circle cx="20" cy="25" r="9" fill={palette.c} fillOpacity="0.85" />
      </g>
      {/* Central accent */}
      <circle cx="20" cy="19" r="2.4" fill="#fbbf24" />
    </svg>
  );
}
