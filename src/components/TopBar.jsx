import { useAppStore } from '../store/useAppStore';
import BrandMark from './BrandMark';

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
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[13.5px] font-bold">김서령</div>
          <div className="text-[11.5px] text-gray-400">소프트웨어융합학부 1학년</div>
        </div>
        <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">김</div>
      </div>
    </header>
  );
}