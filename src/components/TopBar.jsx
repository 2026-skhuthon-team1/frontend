import { useAppStore } from '../store/useAppStore';
import BrandMark from './BrandMark';
import skhuLogo from '../assets/school.png';

export default function TopBar() {
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
          <a className="px-3.5 py-2 text-sm font-bold text-primary-600 bg-primary-100 rounded-lg cursor-pointer">데이터 분석</a>
          <a className="px-3.5 py-2 text-sm font-medium text-gray-400 rounded-lg cursor-pointer hover:text-gray-700 hover:bg-gray-50">시간표 생성</a>
          <a className="px-3.5 py-2 text-sm font-medium text-gray-400 rounded-lg cursor-pointer hover:text-gray-700 hover:bg-gray-50">학업 리포트</a>
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