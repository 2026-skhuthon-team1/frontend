import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { Badge } from '../components/Badge'
import TopBar from '../components/TopBar'
import { useTimetableStore } from '../store/timetableStore'
import { useMajorOptions } from '../hooks/useMajorOptions'
import { fixMojibake } from '../utils/mojibake'

const DAYS = ['월', '화', '수', '목', '금']
const SLOT_MIN = 90
const BASE_MIN = 9 * 60 // 09:00 기준 — 슬롯 인덱스 계산의 시작점
const MIN_SLOTS = 7 // 기본 09:00 ~ 19:30 (90분 × 7칸)

// 시간축 칸 수 — 선택한 시간표의 가장 늦은 수업이 기본 범위를 넘으면 그만큼 칸을 늘린다
const slotCountFor = (courses = []) =>
  Math.max(MIN_SLOTS, ...courses.map((c) => c.slot + c.span))

const slotLabel = (i) => {
  const min = BASE_MIN + i * SLOT_MIN
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

// 한 칸의 높이 — 화면 높이에 맞춰 늘고 줄되, 너무 작거나 커지지 않게 52px ~ 96px 사이로 제한한다
// (380px ≈ 상단바 + 제목줄 + 조건 요약 + 요일 헤더 + 여백)
const slotHeightFor = (slotCount) => `clamp(52px, calc((100vh - 380px) / ${slotCount}), 96px)`

// 학점 구분 — 백엔드 category(전공필수/전공선택/전공탐색/교양필수/교양)만으로는 사회봉사·채플이 교양필수에 섞이므로
// 과목명으로 한 번 더 나눈다. 화면에 보여주는 순서도 이 배열 순서를 따른다.
const CREDIT_TYPES = ['전공', '전공탐색', '사회봉사', '채플', '교양필수', '교양선택']

// 과목 블록 색상 — 학점 구분마다 팔레트 색을 하나씩 고정으로 준다(구분 6개 = 팔레트 6색이라 겹치지 않는다)
const PALETTE = [
  { bg: '#ecfcca', border: '#7ccf00', color: '#3c6300' },
  { bg: '#dbeafe', border: '#2b7fff', color: '#193cb8' },
  { bg: '#ffedd4', border: '#ff6900', color: '#9f2d00' },
  { bg: '#f3e8ff', border: '#ad46ff', color: '#6b21a8' },
  { bg: '#fee2e2', border: '#fb2c36', color: '#9f0712' },
  { bg: '#fef9c3', border: '#f0b100', color: '#894b00' },
]
const colorFor = (creditType) => PALETTE[CREDIT_TYPES.indexOf(creditType) % PALETTE.length]

function creditTypeOf(course) {
  const name = fixMojibake(course.courseName ?? '')
  if (name.includes('사회봉사')) return '사회봉사'
  if (name.includes('채플')) return '채플'
  if (course.category === '전공필수' || course.category === '전공선택') return '전공'
  if (course.category === '전공탐색') return '전공탐색'
  if (course.category === '교양필수') return '교양필수'
  return '교양선택'
}

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// 백엔드 응답(TimetableRecommendationResponseDto)을 화면에서 쓰는 카드 데이터로 변환한다
// RecommendedCourseDto엔 학점 구분별 합계·공강 요일이 따로 없어서 courses로부터 전부 계산한다
function toCard(combo, index, excludeFirstPeriod) {
  const courses = combo.courses ?? []
  const slots = courses.flatMap((c) =>
    (c.times ?? []).map((t) => ({ course: c, day: t.dayOfWeek, startTime: t.startTime, endTime: t.endTime }))
  )

  const freeDays = DAYS.filter((d) => !slots.some((s) => s.day === d))
  const creditsByType = Object.fromEntries(CREDIT_TYPES.map((type) => [type, 0]))
  for (const c of courses) creditsByType[creditTypeOf(c)] += c.credits ?? 0
  const totalCredits = Object.values(creditsByType).reduce((sum, credits) => sum + credits, 0)
  // 0학점인 구분은 빼고 "전공 6 + 사회봉사 2 + 교양선택 3"처럼 보여준다
  const creditSummary = CREDIT_TYPES.filter((type) => creditsByType[type] > 0)
    .map((type) => `${type} ${creditsByType[type]}`)
    .join(' + ')
  const noFirstPeriod = !slots.some((s) => toMin(s.startTime) === toMin('09:00'))
  const hasLunchClass = slots.some((s) => toMin(s.startTime) < toMin('13:30') && toMin(s.endTime) > toMin('12:00'))

  const tags = []
  for (const d of freeDays) tags.push(`#${d}공강`)
  if (!hasLunchClass) tags.push('#점심시간보장')
  if (excludeFirstPeriod && noFirstPeriod) tags.push('#1교시없음')

  const descParts = [creditSummary, `${totalCredits}학점`].filter(Boolean)
  if (freeDays.length > 0) descParts.push(`${freeDays.join('/')} 공강`)
  if (excludeFirstPeriod && noFirstPeriod) descParts.push('1교시 없음')

  const blocks = slots.map((s) => ({
    name: fixMojibake(s.course.courseName),
    type: creditTypeOf(s.course),
    professor: fixMojibake(s.course.professor),
    room: s.course.room,
    day: DAYS.indexOf(s.day),
    slot: Math.max(0, Math.round((toMin(s.startTime) - BASE_MIN) / SLOT_MIN)),
    span: Math.max(1, Math.round((toMin(s.endTime) - toMin(s.startTime)) / SLOT_MIN)),
    ...colorFor(creditTypeOf(s.course)),
  }))

  return {
    id: combo.timetableId ?? index,
    rank: index + 1,
    name: `추천 시간표 ${String.fromCharCode(65 + index)}`,
    desc: descParts.join(' | '),
    tags,
    courses: blocks,
  }
}

export default function TimetableResultPage() {
  const navigate = useNavigate()
  const combinations = useTimetableStore((s) => s.combinations)
  const avoidFirstClass = useTimetableStore((s) => s.avoidFirstClass)
  const { majors, majorCredits, generalCredits, grade, offDays } = useTimetableStore()
  const majorOptions = useMajorOptions()
  const majorsLabel = majors.map((m) => majorOptions.find((o) => o.value === m)?.label ?? m).join('·') || '미선택'
  const offDaysLabel = offDays.length > 0 ? `${offDays.join('/')}요일` : '없음'
  const CARDS = useMemo(
    () => combinations.map((c, i) => toCard(c, i, avoidFirstClass)),
    [combinations, avoidFirstClass]
  )
  const [selectedId, setSelectedId] = useState(null)
  const selected = CARDS.find((c) => c.id === selectedId) ?? CARDS[0]
  const timetableRef = useRef(null)
  const slotCount = slotCountFor(selected?.courses)
  const slotLabels = Array.from({ length: slotCount }, (_, i) => slotLabel(i))

  // 새로고침 등으로 store가 비어있으면 다시 입력부터 하도록 되돌린다
  useEffect(() => {
    if (CARDS.length === 0) navigate('/input', { replace: true })
  }, [CARDS.length, navigate])

  // 시간표 영역을 PNG로 캡처해서 기기에 바로 다운로드
  const saveAsImage = async () => {
    const dataUrl = await toPng(timetableRef.current, { pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${selected?.name}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    // lg(1024px) 이상: 왼쪽 목록 + 오른쪽 시간표 2단, 각 패널이 따로 스크롤
    // lg 미만: 위아래로 쌓고 페이지 전체가 스크롤 (작은 노트북·태블릿에서 아래가 잘리지 않게)
    <div className="min-h-screen flex flex-col bg-white lg:h-screen lg:overflow-hidden">
      <TopBar />

      {/* 본문 — 왼쪽 추천 목록 + 오른쪽 시간표 */}
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* 왼쪽 패널 — AI 추천 조합 목록 */}
        <aside className="w-full shrink-0 bg-[#f8fafc] border-b border-[#f1f5f9] flex flex-col lg:w-[320px] xl:w-[380px] lg:border-b-0 lg:border-r lg:overflow-y-auto">
          <div className="px-6 py-4">
            <span className="font-bold text-base text-[#1d293d]">
              AI 추천 조합 <span className="text-[#7ccf00]">{CARDS.length}</span>
            </span>
          </div>

          {/* lg 미만에서는 카드를 가로로 넘겨 보게 해서 목록이 시간표를 아래로 밀어내지 않게 한다 */}
          <div className="flex gap-3 px-6 pb-6 overflow-x-auto snap-x snap-mandatory lg:flex-col lg:overflow-visible">
            {CARDS.map((combo) => {
              // selectedId가 아직 없으면(첫 화면) 오른쪽에 기본 표시 중인 1순위(selected)가 선택된 것처럼 보이게 한다
              const isSelected = combo.id === selected?.id
              return (
                <button
                  key={combo.id}
                  onClick={() => setSelectedId(combo.id)}
                  className={`w-[260px] shrink-0 snap-start text-left bg-white rounded-2xl border-2 p-5 transition-colors lg:w-full ${
                    isSelected ? 'border-[#7ccf00]' : 'border-[#e2e8f0] hover:border-[#ecfcca]'
                  }`}
                >
                  <div className="mb-2">
                    <Badge variant={isSelected ? 'primary' : 'gray'}>추천 {combo.rank}순위</Badge>
                  </div>
                  <p className="font-bold text-[15px] text-[#1d293d] mb-1">{combo.name}</p>
                  <p className="text-xs text-[#90a1b9]">{combo.desc}</p>
                  {combo.tags.length > 0 && (
                    // 태그가 많아도 카드 밖으로 넘치지 않게 줄바꿈
                    <div className="flex flex-wrap gap-2 mt-3">
                      {combo.tags.map(tag => (
                        <span key={tag} className="text-[11px] text-[#62748e] bg-[#f1f5f9] rounded px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* 오른쪽 패널 — 선택한 조합의 시간표 미리보기 */}
        <main className="flex-1 min-w-0 flex flex-col px-4 py-5 sm:px-8 sm:py-6 lg:overflow-auto">
          {/* 좁은 화면에서는 버튼이 제목 아래로 내려가도록 줄바꿈 허용 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1d293d]">{selected?.name} 미리보기</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={saveAsImage} className="h-10 px-5 text-sm font-bold text-[#1d293d] bg-[#f1f5f9] rounded-xl hover:bg-[#e2e8f0] transition-colors">
                이미지로 저장
              </button>
            </div>
          </div>

          {/* 제출한 조건 요약 — 사용자가 입력한 조건을 다시 확인할 수 있도록 표시 */}
          <div className="mb-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
            <p className="text-[13px] font-bold text-[#90a1b9] mb-2">현재 설정 조건</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#314158]">
              <span>전공 <span className="font-bold text-[#1d293d]">{majorsLabel}</span> | {grade}학년</span>
              <span>목표학점 전공 {majorCredits} + 교양선택 {generalCredits}</span>
              <span>공강요일 {offDaysLabel} | {avoidFirstClass ? '1교시 제외' : '1교시 무관'}</span>
            </div>
          </div>

          {/* 시간표 — 화면이 좁으면 찌그러지지 않고 가로 스크롤 */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
            {/* 캡처(이미지로 저장) 대상 — 최소 폭을 줘서 요일 칸이 너무 좁아지지 않게 한다 */}
            <div
              ref={timetableRef}
              className="min-w-[640px] bg-white"
              style={{ '--slot-h': slotHeightFor(slotCount) }}
            >
              {/* 요일 헤더 행 — 월/화/수/목/금 */}
              <div
                className="grid bg-[#f8fafc] border-b border-[#e2e8f0]"
                style={{ gridTemplateColumns: '56px repeat(5, minmax(0, 1fr))' }}
              >
                <div className="h-10 border-r border-[#e2e8f0]" />
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`h-10 flex items-center justify-center font-bold text-sm text-[#1d293d] ${i < 4 ? 'border-r border-[#e2e8f0]' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 시간표 본문 — 시간 라벨 + 요일별 수업 블록 */}
              <div className="grid" style={{ gridTemplateColumns: '56px repeat(5, minmax(0, 1fr))' }}>
                {/* 시간 라벨 열 — 09:00부터 가장 늦은 수업이 끝나는 칸까지 */}
                <div className="border-r border-[#e2e8f0]">
                  {slotLabels.map((time, i) => (
                    <div
                      key={time}
                      className={`flex items-start justify-center pt-2 ${i < slotCount - 1 ? 'border-b border-[#e2e8f0]' : ''}`}
                      style={{ height: 'var(--slot-h)' }}
                    >
                      <span className="text-xs text-[#90a1b9]">{time}</span>
                    </div>
                  ))}
                </div>

                {/* 요일별 열 — 각 요일에 해당하는 수업 블록을 칸 수 대비 비율(%)로 배치해서 높이가 바뀌어도 위치가 맞는다 */}
                {DAYS.map((day, dayIdx) => (
                  <div
                    key={day}
                    className={`relative ${dayIdx < 4 ? 'border-r border-[#e2e8f0]' : ''}`}
                    style={{ height: `calc(var(--slot-h) * ${slotCount})` }}
                  >
                    {/* 시간 구분선 — 각 슬롯(1.5시간) 사이 가로선 */}
                    {slotLabels.map((_, i) => (
                      i < slotCount - 1 && (
                        <div
                          key={i}
                          className="absolute w-full border-b border-[#e2e8f0]"
                          style={{ top: `${((i + 1) / slotCount) * 100}%` }}
                        />
                      )
                    ))}

                    {/* 수업 블록 — slot(시작 칸)과 span(차지하는 칸 수)으로 위치·높이 계산 */}
                    {selected?.courses
                      .filter(c => c.day === dayIdx)
                      .map((course, i) => (
                        <div
                          key={i}
                          className="absolute rounded overflow-hidden flex flex-col justify-start px-2 py-1.5"
                          style={{
                            top: `calc(${(course.slot / slotCount) * 100}% + 2px)`,
                            height: `calc(${(course.span / slotCount) * 100}% - 4px)`,
                            left: 2,
                            right: 2,
                            backgroundColor: course.bg,
                            borderLeft: `3px solid ${course.border}`,
                            color: course.color,
                          }}
                        >
                          <p className="text-xs font-bold leading-tight truncate">{course.name}</p>
                          {/* 75분 수업(1칸)에서도 잘리지 않게 유형·교수·강의실을 한 줄로 */}
                          <p className="text-[11px] leading-tight mt-0.5 truncate opacity-80">
                            {[course.type, course.professor, course.room].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
