import { useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { label: '데이터 분석', path: '/upload' },
  { label: '시간표 생성', path: '/input' },
  { label: '학업 리포트', path: '/report' },
]

export default function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // /result는 시간표 생성 흐름에 속함
  const activeLabel = pathname.startsWith('/result')
    ? '시간표 생성'
    : NAV.find((n) => pathname.startsWith(n.path))?.label

  return (
    <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-9">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="font-extrabold text-base tracking-tight">시간표짜조</span>
        </div>
        <nav className="flex gap-1">
          {NAV.map(({ label, path }) => {
            const active = label === activeLabel
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`px-3.5 py-2 text-sm rounded-lg transition-colors ${
                  active
                    ? 'font-bold text-primary-600 bg-primary-100'
                    : 'font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[13.5px] font-bold">김서령</div>
          <div className="text-[11.5px] text-gray-400">소프트웨어융합학부 1학년</div>
        </div>
        <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">김</div>
      </div>
    </header>
  )
}
