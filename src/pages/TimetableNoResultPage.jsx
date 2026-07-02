import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useTimetableStore } from '../store/timetableStore'

export default function TimetableNoResultPage() {
  const navigate = useNavigate()
  // 필터 요약 카드에 사용자가 실제로 입력한 조건을 그대로 보여줘야 하므로 store 값을 직접 읽는다
  const { majorCredits, generalCredits, grade, offDays, avoidFirstClass } = useTimetableStore()

  // 선호 공강 / 1교시 회피는 결과를 0개로 만든 제약일 가능성이 높은 조건이라 강조(highlight) 표시한다
  const filters = [
    { label: '목표 학점', value: `${majorCredits + generalCredits}학점`, highlight: false },
    { label: '선호 공강', value: offDays.length > 0 ? offDays.map((d) => `${d}요일`).join('/') : '없음', highlight: true },
    { label: '1교시 수업', value: avoidFirstClass ? '가급적 피하기' : '상관없음', highlight: true },
    { label: '학년 설정', value: `${grade}학년`, highlight: false },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* 헤더는 다른 페이지와 동일하게 TopBar 공용 컴포넌트를 그대로 사용한다 */}
      <TopBar />

      <main className="flex-1 flex flex-col items-center px-8 py-16">
        <div className="w-full max-w-[672px] flex flex-col items-center">
          {/* 아이콘 — 검색 아이콘 원 + 우하단 경고 배지 */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-[#f1f5f9] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#cad5e2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth={2} />
                <path strokeLinecap="round" strokeWidth={2} d="M20 20l-3.5-3.5" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#fe9a00]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2 1 21h22L12 2zm0 6 6.5 11h-13L12 8zm-1 3v3h2v-3h-2zm0 4v2h2v-2h-2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-[28px] font-bold text-[#0f172b] text-center">조건에 맞는 시간표를 찾지 못했습니다</h2>
          <p className="text-lg text-[#62748e] text-center mt-4 leading-relaxed">
            현재 설정하신 조건들을 모두 만족하는 수업 조합이 존재하지 않습니다.<br />
            일부 조건을 완화하면 AI가 새로운 대안을 찾아드릴 수 있습니다.
          </p>

          {/* 현재 설정된 필터 요약 */}
          <div className="w-full bg-white rounded-3xl border border-[#e2e8f0] p-8 mt-10">
            <p className="text-[13px] font-bold text-[#90a1b9] tracking-wide">현재 설정된 필터 요약</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6">
              {filters.map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${highlight ? 'bg-[#fffbeb]' : 'bg-[#f8fafc]'}`}>
                    <div className={`w-2 h-2 rounded-full ${highlight ? 'bg-[#fe9a00]' : 'bg-[#90a1b9]'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#90a1b9]">{label}</p>
                    <p className="text-base font-bold text-[#314158]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/input')}
            className="w-full h-[68px] mt-8 rounded-2xl bg-[#7ccf00] text-white font-bold text-lg hover:bg-[#5ea500] transition-colors"
          >
            조건 수정하러 가기
          </button>
        </div>
      </main>
    </div>
  )
}
