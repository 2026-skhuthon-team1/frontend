import { useLocation } from 'react-router-dom';
import BrandMark from './BrandMark';
import skhuLogo from '../assets/school.png';

// 시간표 생성 흐름은 /input(입력), /result, /result/empty(결과) 세 경로를 모두 아우른다
const NAV_ITEMS = [
  { label: '데이터 분석', prefixes: ['/upload'] },
  { label: '시간표 생성', prefixes: ['/input', '/result'] },
]

export default function TopBar() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-9">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-primary-500 rounded-lg flex items-center justify-center p-[6px]">
            <BrandMark />
          </div>
          <span className="font-extrabold text-base tracking-tight">시간표짜조</span>
        </div>
        <nav className="flex gap-1">
          {NAV_ITEMS.map(({ label, prefixes }) => {
            const isActive = prefixes.some((p) => pathname.startsWith(p))
            return (
              <a
                key={label}
                className={`px-3.5 py-2 text-sm rounded-lg cursor-pointer ${
                  isActive
                    ? 'font-bold text-primary-600 bg-primary-100'
                    : 'font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </a>
            )
          })}
        </nav>
      </div>
     <div className="flex items-center gap-2">
        <div className="text-right leading-tight">
          <div className="text-[13.5px] font-bold">성공회대학교</div>
          <a href="https://portal.skhu.ac.kr/html/main/sso.html"
            target="_blank" rel="noopener noreferrer"
            className="text-[11.5px] text-gray-400 hover:text-primary-600 transition cursor-pointer">
            학교 포털 바로가기
          </a>
        </div>
        <div className="w-[38px] h-[38px] rounded-full overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
          <img src={skhuLogo} alt="school" className="w-full h-full object-contain p-1" />
        </div>
      </div>
    </header>
  );
}