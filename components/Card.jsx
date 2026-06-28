import { Badge } from './Badge'

export function Card({ variant = 'default', badge, title, meta, className = '' }) {
  const border = variant === 'selected' ? 'border-[#7ccf00]' : 'border-[#e2e8f0]'
  const badgeVariant = variant === 'selected' ? 'primary' : 'gray'

  return (
    <div className={`bg-white border ${border} rounded-2xl p-4 flex flex-col gap-2 ${className}`}>
      {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      {title && <p className="font-bold text-sm text-[#1d293d] mt-1">{title}</p>}
      {meta && <p className="text-xs text-[#90a1b9]">{meta}</p>}
    </div>
  )
}
