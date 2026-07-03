import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import TopBar from '../components/TopBar'
import { useTimetableStore } from '../store/timetableStore'
import { useMajorOptions } from '../hooks/useMajorOptions'
import { fixMojibake } from '../utils/mojibake'

const TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00']
const DAYS = ['월', '화', '수', '목', '금']
const SLOT_H = 64
const SLOT_MIN = 90
const BASE_MIN = 9 * 60 // 09:00 기준 — 슬롯 인덱스 계산의 시작점

// 과목 블록 색상 — category 문자열을 해시로 팔레트에 매핑해서 카테고리마다 일관된 색을 준다
const PALETTE = [
  { bg: '#ecfcca', border: '#7ccf00', color: '#3c6300' },
  { bg: '#dbeafe', border: '#2b7fff', color: '#193cb8' },
  { bg: '#ffedd4', border: '#ff6900', color: '#9f2d00' },
  { bg: '#f3e8ff', border: '#ad46ff', color: '#6b21a8' },
  { bg: '#fee2e2', border: '#fb2c36', color: '#9f0712' },
  { bg: '#fef9c3', border: '#f0b100', color: '#894b00' },
]
function colorFor(category) {
  let hash = 0
  for (const ch of category ?? '') hash = (hash * 31 + ch.charCodeAt(0)) % PALETTE.length
  return PALETTE[hash]
}

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// 백엔드 응답(TimetableRecommendationResponseDto)을 화면에서 쓰는 카드 데이터로 변환한다
// RecommendedCourseDto엔 전공/교양 합계·공강 요일이 따로 없어서 courses[].times로부터 전부 계산한다
function toCard(combo, index, excludeFirstPeriod) {
  const courses = combo.courses ?? []
  const slots = courses.flatMap((c) =>
    (c.times ?? []).map((t) => ({ course: c, day: t.dayOfWeek, startTime: t.startTime, endTime: t.endTime }))
  )

  const freeDays = DAYS.filter((d) => !slots.some((s) => s.day === d))
  const majorCredits = courses.filter((c) => c.category !== '교양').reduce((sum, c) => sum + c.credits, 0)
  const generalCredits = courses.filter((c) => c.category === '교양').reduce((sum, c) => sum + c.credits, 0)
  const totalCredits = majorCredits + generalCredits
  const noFirstPeriod = !slots.some((s) => toMin(s.startTime) === toMin('09:00'))
  const hasLunchClass = slots.some((s) => toMin(s.startTime) < toMin('13:30') && toMin(s.endTime) > toMin('12:00'))

  const tags = []
  for (const d of freeDays) tags.push(`#${d}공강`)
  if (!hasLunchClass) tags.push('#점심시간보장')
  if (excludeFirstPeriod && noFirstPeriod) tags.push('#1교시없음')

  const descParts = [`전공 ${majorCredits} + 교양 ${generalCredits}`, `${totalCredits}학점`]
  if (freeDays.length > 0) descParts.push(`${freeDays.join('/')} 공강`)
  if (excludeFirstPeriod && noFirstPeriod) descParts.push('1교시 없음')

  const blocks = slots.map((s) => ({
    name: fixMojibake(s.course.courseName),
    type: s.course.category,
    professor: fixMojibake(s.course.professor),
    room: s.course.room,
    day: DAYS.indexOf(s.day),
    slot: Math.round((toMin(s.startTime) - BASE_MIN) / SLOT_MIN),
    span: Math.max(1, Math.round((toMin(s.endTime) - toMin(s.startTime)) / SLOT_MIN)),
    ...colorFor(s.course.category),
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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <TopBar />

      {/* 본문 — 왼쪽 추천 목록 + 오른쪽 시간표 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널 — AI 추천 조합 목록 */}
        <aside className="w-[400px] shrink-0 bg-[#f8fafc] border-r border-[#f1f5f9] flex flex-col overflow-y-auto">
          <div className="px-6 py-4">
            <span className="font-bold text-base text-[#1d293d]">
              AI 추천 조합 <span className="text-[#7ccf00]">{CARDS.length}</span>
            </span>
          </div>

          <div className="flex flex-col gap-3 px-6 pb-6">
            {CARDS.map((combo) => {
              const isSelected = combo.id === selectedId
              return (
                <button
                  key={combo.id}
                  onClick={() => setSelectedId(combo.id)}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-5 transition-colors ${
                    isSelected ? 'border-[#7ccf00]' : 'border-[#e2e8f0] hover:border-[#ecfcca]'
                  }`}
                >
                  <div className="mb-2">
                    <Badge variant={isSelected ? 'primary' : 'gray'}>추천 {combo.rank}순위</Badge>
                  </div>
                  <p className="font-bold text-[15px] text-[#1d293d] mb-1">{combo.name}</p>
                  <p className="text-[11px] text-[#90a1b9]">{combo.desc}</p>
                  {combo.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {combo.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-[#62748e] bg-[#f1f5f9] rounded px-2 py-1">
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
        <main className="flex-1 flex flex-col overflow-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1d293d]">{selected?.name} 미리보기</h2>
            <div className="flex gap-3">
              <button onClick={saveAsImage} className="h-10 px-5 text-sm font-bold text-[#1d293d] bg-[#f1f5f9] rounded-xl hover:bg-[#e2e8f0] transition-colors">
                이미지로 저장
              </button>
              <Button variant="small" className="hover:bg-[#5ea500] transition-colors">
                최종 선택 및 확정
              </Button>
            </div>
          </div>

          {/* 제출한 조건 요약 — 사용자가 입력한 조건을 다시 확인할 수 있도록 표시 */}
          <div className="mb-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
            <p className="text-[13px] font-bold text-[#90a1b9] mb-2">현재 설정 조건</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#314158]">
              <span>전공 <span className="font-bold text-[#1d293d]">{majorsLabel}</span> | {grade}학년</span>
              <span>목표학점 전공 {majorCredits} + 교양 {generalCredits}</span>
              <span>공강요일 {offDaysLabel} | {avoidFirstClass ? '1교시 제외' : '1교시 무관'}</span>
            </div>
          </div>

          {/* 시간표 */}
          <div ref={timetableRef} className="border border-[#e2e8f0] rounded-xl overflow-hidden">
            {/* 요일 헤더 행 — 월/화/수/목/금 */}
            <div
              className="grid bg-[#f8fafc] border-b border-[#e2e8f0]"
              style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}
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
            <div className="grid" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
              {/* 시간 라벨 열 — 09:00 ~ 18:00 */}
              <div className="border-r border-[#e2e8f0]">
                {TIMES.map((time, i) => (
                  <div
                    key={time}
                    className={`h-16 flex items-start justify-center pt-2 ${i < TIMES.length - 1 ? 'border-b border-[#e2e8f0]' : ''}`}
                  >
                    <span className="text-[11px] text-[#90a1b9]">{time}</span>
                  </div>
                ))}
              </div>

              {/* 요일별 열 — 각 요일에 해당하는 수업 블록을 절대 위치로 배치 */}
              {DAYS.map((day, dayIdx) => (
                <div
                  key={day}
                  className={`relative ${dayIdx < 4 ? 'border-r border-[#e2e8f0]' : ''}`}
                  style={{ height: TIMES.length * SLOT_H }}
                >
                  {/* 시간 구분선 — 각 슬롯(1.5시간) 사이 가로선 */}
                  {TIMES.map((_, i) => (
                    i < TIMES.length - 1 && (
                      <div
                        key={i}
                        className="absolute w-full border-b border-[#e2e8f0]"
                        style={{ top: (i + 1) * SLOT_H }}
                      />
                    )
                  ))}

                  {/* 수업 블록 — slot(시작 슬롯)과 span(차지하는 슬롯 수)으로 위치·높이 계산 */}
                  {selected?.courses
                    .filter(c => c.day === dayIdx)
                    .map((course, i) => (
                      <div
                        key={i}
                        className="absolute rounded overflow-hidden flex flex-col justify-start p-2"
                        style={{
                          top: course.slot * SLOT_H + 2,
                          height: course.span * SLOT_H - 4,
                          left: 2,
                          right: 2,
                          backgroundColor: course.bg,
                          borderLeft: `3px solid ${course.border}`,
                          color: course.color,
                        }}
                      >
                        <p className="text-[10px] font-bold leading-tight truncate">{course.name}</p>
                        <p className="text-[8px] leading-tight mt-0.5 truncate opacity-80">{course.type}</p>
                        <p className="text-[8px] leading-tight truncate opacity-80">{course.professor} · {course.room}</p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
