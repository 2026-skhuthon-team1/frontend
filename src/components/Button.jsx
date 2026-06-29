const styles = {
  primary:   'bg-[#7ccf00] text-white rounded-xl h-14 px-6 font-bold text-base',
  secondary: 'bg-white border border-[#f1f5f9] text-[#1d293d] rounded-xl h-14 px-6 font-bold text-base',
  ghost:     'bg-[#f7fee7] border border-[#7ccf00] text-[#3c6300] rounded-xl h-14 px-6 font-bold text-base',
  disabled:  'bg-[#e2e8f0] text-[#90a1b9] rounded-2xl h-14 px-6 font-bold text-base cursor-not-allowed',
  small:     'bg-[#7ccf00] text-white rounded-xl h-10 px-5 font-bold text-sm',
  kakao:     'bg-[#fee500] text-[#0f172b] rounded-full h-12 px-6 font-bold text-[15px]',
  naver:     'bg-[#03c75a] text-white rounded-full h-12 px-6 font-bold text-[15px]',
}

export function Button({ variant = 'primary', children, className = '', ...props }) {
  return (
    <button
      disabled={variant === 'disabled'}
      className={`inline-flex items-center justify-center ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
