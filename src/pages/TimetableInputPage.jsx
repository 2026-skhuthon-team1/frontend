import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useTimetableInput } from '../hooks/useTimetableInput'

const DAYS = ['월', '화', '수', '목', '금']
const GRADES = [1, 2, 3, 4]

function SectionRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-5 gap-6">
      <div className="w-[218px] shrink-0">
        <p className="text-[15px] font-bold text-[#1d293d]">{label}</p>
        <p className="text-[11px] text-[#90a1b9] mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  )
}

function ToggleBtn({ active, onClick, children, wide }) {
  return (
    <button
      onClick={onClick}
      className={`h-14 font-bold text-base rounded-xl border-2 transition-colors
        ${wide ? 'px-6' : 'w-14'}
        ${active
          ? 'bg-[#f7fee7] border-[#7ccf00] text-[#5ea500]'
          : 'bg-white border-[#e2e8f0] text-[#62748e] hover:border-[#ecfcca]'
        }`}
    >
      {children}
    </button>
  )
}

export default function TimetableInputPage() {
  const navigate = useNavigate()
  const {
    credits, grade, offDays, avoidFirstClass,
    setCredits, setGrade, toggleOffDay, setAvoidFirstClass,
    loading, error, submit,
  } = useTimetableInput()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-[#f1f5f9] flex items-center px-8">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7ccf00] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span className="text-[20px] font-bold text-[#1d293d]">시간표짜조</span>
          </div>
          <nav className="flex gap-6">
            {[
              { label: '데이터 분석', path: '/upload' },
              { label: '시간표 생성', path: '/input', active: true },
              { label: '학업 리포트', path: '/report' },
            ].map(({ label, path, active }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`text-base font-medium transition-colors ${active ? 'text-[#5ea500]' : 'text-[#45556c] hover:text-[#5ea500]'}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-[#1d293d]">김철수 학생</p>
            <p className="text-xs text-[#62748e]">컴퓨터공학과 3학년</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#e2e8f0]" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-8 py-12">
        <div className="w-full max-w-[800px] flex flex-col gap-8">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-bold text-[#0f172b]">어떤 시간표를 원하시나요?</h1>
            <p className="text-[15px] text-[#62748e]">
              입력하신 선호도에 맞춰 AI가 수천 개의 조합 중 최적의 안을 선별합니다.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#f1f5f9] px-10 py-2 flex flex-col divide-y divide-[#f1f5f9]">
            {/* 목표 취득 학점 */}
            <SectionRow label="목표 취득 학점" description="이번 학기에 수강할 총 학점">
              <input
                type="range"
                min={6}
                max={21}
                step={1}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-[280px] accent-[#7ccf00]"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold text-[#5ea500]">{credits}</span>
                <span className="text-base text-[#90a1b9]">학점</span>
              </div>
            </SectionRow>

            {/* 현재 학년 */}
            <SectionRow label="현재 학년" description="본인의 현재 학년을 선택해 주세요">
              {GRADES.map((g) => (
                <ToggleBtn key={g} active={grade === g} onClick={() => setGrade(g)} wide>
                  {g}학년
                </ToggleBtn>
              ))}
            </SectionRow>

            {/* 선호 공강 요일 */}
            <SectionRow label="선호 공강 요일" description="수업이 없었으면 하는 요일">
              {DAYS.map((day) => (
                <ToggleBtn key={day} active={offDays.includes(day)} onClick={() => toggleOffDay(day)}>
                  {day}
                </ToggleBtn>
              ))}
            </SectionRow>

            {/* 1교시 수업 여부 */}
            <SectionRow label="1교시 수업 여부" description="오전 9시 수업 포함 여부">
              {[
                { label: '가급적 피하기', value: true },
                { label: '상관 없음', value: false },
              ].map(({ label, value }) => (
                <label key={label} onClick={() => setAvoidFirstClass(value)} className="flex items-center gap-2 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] flex items-center justify-center">
                    {avoidFirstClass === value && (
                      <div className="w-3 h-3 rounded-full bg-[#7ccf00]" />
                    )}
                  </div>
                  <span className="text-base font-medium text-[#314158]">{label}</span>
                </label>
              ))}
            </SectionRow>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)} className="hover:bg-[#90a1b9] hover:text-white transition-colors">
              이전으로
            </Button>
            <Button variant="primary" onClick={submit} disabled={loading} className="px-8 hover:bg-[#5ea500] transition-colors">
              {loading ? '생성 중...' : 'AI 시간표 생성하기'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
