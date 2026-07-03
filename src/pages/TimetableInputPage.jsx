import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useTimetableInput } from '../hooks/useTimetableInput'
import { useMajorOptions } from '../hooks/useMajorOptions'
import TopBar from '../components/TopBar'

const DAYS = ['월', '화', '수', '목', '금']
const GRADES = [1, 2, 3, 4] // 1학년은 아직 시간표 입력 대상이 아니므로 제외

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

function MajorSelect({ values, onToggle, options }) {
  const labelOf = (value) => options.find((o) => o.value === value)?.label ?? value
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          value=""
          onChange={(e) => e.target.value && onToggle(e.target.value)}
          className="h-14 min-w-[220px] rounded-xl border-2 border-[#e2e8f0] bg-white px-4 pr-10 text-[#90a1b9] text-base font-medium appearance-none focus:outline-none focus:border-[#7ccf00] cursor-pointer transition-colors"
        >
          <option value="">전공을 선택하세요</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={values.includes(o.value)}>{o.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-[#90a1b9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onToggle(m)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#f7fee7] border border-[#7ccf00] text-[#5ea500] text-sm font-medium hover:bg-[#ecfcca] transition-colors"
            >
              {labelOf(m)}
              <span className="text-[#90a1b9] leading-none">✕</span>
            </button>
          ))}
        </div>
      )}
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
    majorCredits, generalCredits, grade, offDays, avoidFirstClass, includeSocialService, majors,
    setMajorCredits, setGeneralCredits, setGrade, toggleOffDay, setAvoidFirstClass, setIncludeSocialService, toggleMajor,
    loading, error, submit,
  } = useTimetableInput()
  const majorOptions = useMajorOptions()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <TopBar />

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
            {/* 전공 학점 */}
            <SectionRow label="전공 학점" description="이번 학기에 수강할 전공 학점">
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={majorCredits}
                onChange={(e) => setMajorCredits(Number(e.target.value))}
                className="w-[280px] accent-[#7ccf00]"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold text-[#5ea500]">{majorCredits}</span>
                <span className="text-base text-[#90a1b9]">학점</span>
              </div>
            </SectionRow>

            {/* 교양 학점 */}
            <SectionRow label="교양 학점" description="이번 학기에 수강할 교양 학점">
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={generalCredits}
                onChange={(e) => setGeneralCredits(Number(e.target.value))}
                className="w-[280px] accent-[#7ccf00]"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold text-[#5ea500]">{generalCredits}</span>
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

            {/* 사회봉사 포함 여부 */}
            <SectionRow label="사회봉사 포함 여부" description="사회봉사 과목 시간표에 포함">
              {[
                { label: '포함', value: true },
                { label: '포함 안 함', value: false },
              ].map(({ label, value }) => (
                <label key={label} onClick={() => setIncludeSocialService(value)} className="flex items-center gap-2 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] flex items-center justify-center">
                    {includeSocialService === value && (
                      <div className="w-3 h-3 rounded-full bg-[#7ccf00]" />
                    )}
                  </div>
                  <span className="text-base font-medium text-[#314158]">{label}</span>
                </label>
              ))}
            </SectionRow>

            {/* 전공 선택 — 복수전공 시 여러 개 선택 가능 */}
            <SectionRow label="전공 선택" description="복수전공의 경우 복수 선택 가능">
              <MajorSelect values={majors} onToggle={toggleMajor} options={majorOptions} />
            </SectionRow>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)} className="hover:bg-[#90a1b9] hover:text-white transition-colors">
              이전으로
            </Button>
            <Button variant="primary" onClick={submit} disabled={loading || majors.length === 0} className="px-8 hover:bg-[#5ea500] transition-colors">
              {loading ? '생성 중...' : majors.length === 0 ? '전공을 선택해 주세요' : 'AI 시간표 생성하기'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
