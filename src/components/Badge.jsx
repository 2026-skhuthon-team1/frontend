const badgeStyles = {
  primary: 'bg-[#7ccf00] text-white rounded-full',
  light:   'bg-[#ecfcca] border border-[#7ccf00] text-[#3c6300] rounded-full',
  gray:    'bg-[#f1f5f9] text-[#62748e] rounded-full',
}

const tagStyles = {
  orange: 'bg-[#ffedd4] text-[#9f2d00] rounded-xl',
  blue:   'bg-[#dbeafe] text-[#193cb8] rounded-xl',
}

export function Badge({ variant = 'primary', children, className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center px-3 h-[26px] text-[10px] font-bold ${badgeStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Tag({ variant = 'orange', children, className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center px-3 h-[30px] text-[11px] font-bold ${tagStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
