import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useTimetableInput } from '../hooks/useTimetableInput'
import { useMajorOptions, useDepartmentOptions } from '../hooks/useMajorOptions'
import { FREE_MAJOR } from '../store/timetableStore'
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

function MajorSelect({ values, onToggle, options, placeholder }) {
  const labelOf = (value) => options.find((o) => o.value === value)?.label ?? value
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          value=""
          onChange={(e) => e.target.value && onToggle(e.target.value)}
          className="h-14 min-w-[220px] rounded-xl border-2 border-[#e2e8f0] bg-white px-4 pr-10 text-[#90a1b9] text-base font-medium appearance-none focus:outline-none focus:border-[#7ccf00] cursor-pointer transition-colors"
        >
          <option value="">{placeholder}</option>
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
    majorCredits, generalCredits, grade, offDays, avoidFirstClass, includeSocialService, majors, explorationDepartments,
    firstYearFirstSemester, firstYearSecondSemester,
    setMajorCredits, setGeneralCredits, setGrade, toggleOffDay, setAvoidFirstClass, setIncludeSocialService, toggleMajor,
    toggleDepartment, toggleExplorationDepartment,
    loading, error, submit,
  } = useTimetableInput()
  const majorOptions = useMajorOptions()
  const departmentOptions = useDepartmentOptions()

  // 1학년 1·2학기는 전공탐색만 수강 — 학년 선택/사회봉사를 숨기고 전공 학점 대신 전공탐색 학점을 받는다
  const isFreshman = firstYearFirstSemester || firstYearSecondSemester
  const isFreeMajor = isFreshman && majors.includes(FREE_MAJOR)
  // 2학년 이상은 학년을 골라야 요청할 수 있다(1학년은 applyFreshmanDefaults가 1로 정해 둔다)
  const missingGrade = !isFreshman && grade === null
  // 전공·교양 모두 0학점이면 들을 과목이 없어 빈 시간표만 나오므로 제출을 막는다.
  // 단 2학년 이상이 사회봉사를 포함하면 사회봉사만 들어간 시간표를 만들 수 있다(교양 학점은 사회봉사 제외).
  const onlySocialService = !isFreshman && includeSocialService
  const missingCredits = majorCredits === 0 && generalCredits === 0 && !onlySocialService
  // 조건이 덜 채워져 제출할 수 없는 상태 — 버튼을 회색 비활성화 모양으로 바꿔 누를 수 없음을 보여준다
  const blocked = majors.length === 0 || missingGrade || missingCredits

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
            {/* 전공 학점 — 1학년(1·2학기)은 아직 전공이 없어 전공탐색 학점으로 대신 받는다(수강신청 안내상 학기당 상한 없음) */}
            <SectionRow
              label={isFreshman ? '전공탐색 학점' : '전공 학점'}
              description={isFreshman ? '이번 학기에 수강할 전공탐색 학점' : '이번 학기에 수강할 전공 학점'}
            >
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

            {/* 교양 학점 — 1학년은 CourseSelectPage에서 고른 교양필수·채플이 이 학점에 포함되고, 2학년 이상은 사회봉사가 빠진다(포함 여부로 따로 넣음) */}
            <SectionRow
              label="교양 학점"
              description={isFreshman ? '이번 학기에 수강할 교양 학점 (교양필수 및 채플 포함)' : '이번 학기에 수강할 교양 학점 (사회봉사 제외)'}
            >
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

            {/* 현재 학년 — 1학년(1·2학기)은 학년이 확정돼 있으니 물어볼 필요 없다 */}
            {!isFreshman && (
              <SectionRow label="현재 학년" description="본인의 현재 학년을 선택해 주세요">
                {GRADES.map((g) => (
                  <ToggleBtn key={g} active={grade === g} onClick={() => setGrade(g)} wide>
                    {g}학년
                  </ToggleBtn>
                ))}
              </SectionRow>
            )}

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

            {/* 사회봉사 포함 여부 — 1학년은 수강 불가, FirstYearTimetableRequestDto엔 이 필드 자체가 없다 */}
            {!isFreshman && (
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
            )}

            {/* 1학년은 아직 전공이 없어 학부(하나)를 고른다. 자유전공 여부는 CourseSelectPage에서 이미 답해
                자유전공이면 학부가 자유전공학부로 정해져 있으므로 이 칸을 숨기고, 아니면 자유전공학부 없이 학부만 보여준다 */}
            {isFreshman ? (
              !isFreeMajor && (
                <SectionRow label="학부 선택" description="소속 학부를 선택해 주세요">
                  <MajorSelect
                    values={majors}
                    onToggle={toggleDepartment}
                    options={departmentOptions}
                    placeholder="학부를 선택하세요"
                  />
                </SectionRow>
              )
            ) : (
              /* 전공 선택 — 복수전공 시 여러 개 선택 가능 */
              <SectionRow label="전공 선택" description="복수전공의 경우 복수 선택 가능">
                <MajorSelect values={majors} onToggle={toggleMajor} options={majorOptions} placeholder="전공을 선택하세요" />
              </SectionRow>
            )}

            {/* 자유전공은 소속 학부가 없어 전공탐색을 들을 학부를 따로 고른다 — 안 고르면 전체 학부가 후보 */}
            {isFreeMajor && (
              <SectionRow label="전공탐색 학부 선택" description="전공탐색 과목을 들을 학부 (미선택 시 전체 학부)">
                <MajorSelect
                  values={explorationDepartments}
                  onToggle={toggleExplorationDepartment}
                  options={departmentOptions}
                  placeholder="학부를 선택하세요"
                />
              </SectionRow>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)} className="hover:bg-[#90a1b9] hover:text-white transition-colors">
              이전으로
            </Button>
            <Button
              variant={blocked ? 'disabled' : 'primary'}
              onClick={submit}
              disabled={loading || blocked}
              className={`px-8 transition-colors ${blocked ? '' : 'hover:bg-[#5ea500]'}`}
            >
              {loading ? '생성 중...'
                : missingGrade ? '학년을 선택해 주세요'
                : missingCredits ? '전공 또는 교양 학점을 정해 주세요'
                : majors.length === 0 ? (isFreshman ? '학부를 선택해 주세요' : '전공을 선택해 주세요')
                : 'AI 시간표 생성하기'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
