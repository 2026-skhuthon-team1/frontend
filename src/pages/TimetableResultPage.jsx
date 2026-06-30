import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'

const TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00']
const DAYS = ['월', '화', '수', '목', '금']
const SLOT_H = 64

// ponytail: 임시 데이터 — 백엔드 연동 시 API 응답 형태에 맞게 교체 필요
const COMBINATIONS = [
  {
    id: 1, rank: 1, satisfaction: 98,
    name: '추천 시간표 A',
    desc: '전공 4 + 교양 2 | 18학점 | 금공강 | 1교시 없음',
    tags: ['#금공강', '#점심시간보장', '#1교시없음'],
    courses: [
      { name: '알고리즘',    room: '정보관 402호', day: 0, slot: 1, span: 2, bg: '#ecfcca', border: '#7ccf00', color: '#3c6300' },
      { name: '현대사회와윤리', room: '인문관 101호',  day: 0, slot: 4, span: 1, bg: '#dbeafe', border: '#2b7fff', color: '#193cb8' },
      { name: '운영체제',    room: '정보관 205호', day: 1, slot: 2, span: 2, bg: '#ffedd4', border: '#ff6900', color: '#9f2d00' },
      { name: '알고리즘',    room: '정보관 402호', day: 2, slot: 1, span: 2, bg: '#ecfcca', border: '#7ccf00', color: '#3c6300' },
      { name: '운영체제',    room: '정보관 205호', day: 3, slot: 2, span: 2, bg: '#ffedd4', border: '#ff6900', color: '#9f2d00' },
      { name: '창업과경영',   room: '경영관 303호', day: 3, slot: 5, span: 1, bg: '#f3e8ff', border: '#ad46ff', color: '#6b21a8' },
    ],
  },
  {
    id: 2, rank: 2, satisfaction: 92,
    name: '추천 시간표 B',
    desc: '전공 5 + 교양 1 | 18학점 | 수/금 공강 | 1교시 없음',
    tags: ['#수공강', '#금공강'],
    courses: [],
  },
  {
    id: 3, rank: 3, satisfaction: 89,
    name: '추천 시간표 C',
    desc: '전공 3 + 교양 3 | 17학점',
    tags: ['#점심시간보장'],
    courses: [],
  },
]

export default function TimetableResultPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(1)
  const selected = COMBINATIONS.find(c => c.id === selectedId)
  const timetableRef = useRef(null)

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
      {/* 헤더 — 로고, 학기 정보 */}
      <header className="h-16 shrink-0 bg-white border-b border-[#f1f5f9] flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#7ccf00] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="text-lg font-bold text-[#1d293d]">시간표짜조</span>
          <div className="w-px h-4 bg-[#e2e8f0] mx-1" />
          <span className="text-sm text-[#62748e]">2026년 1학기 수강 신청</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#e2e8f0]" />
      </header>

      {/* 본문 — 왼쪽 추천 목록 + 오른쪽 시간표 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널 — AI 추천 조합 목록 */}
        <aside className="w-[400px] shrink-0 bg-[#f8fafc] border-r border-[#f1f5f9] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4">
            <span className="font-bold text-base text-[#1d293d]">
              AI 추천 조합 <span className="text-[#7ccf00]">12</span>
            </span>
            <button className="text-xs text-[#62748e] border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-white hover:border-[#ecfcca] transition-colors">
              정렬: 만족도순
            </button>
          </div>

          <div className="flex flex-col gap-3 px-6 pb-6">
            {COMBINATIONS.map((combo) => {
              const isSelected = combo.id === selectedId
              return (
                <button
                  key={combo.id}
                  onClick={() => setSelectedId(combo.id)}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-5 transition-colors ${
                    isSelected ? 'border-[#7ccf00]' : 'border-[#e2e8f0] hover:border-[#ecfcca]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={isSelected ? 'primary' : 'gray'}>추천 {combo.rank}순위</Badge>
                    <span className="text-xs text-[#62748e]">만족도 {combo.satisfaction}%</span>
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
                        <p className="text-[8px] leading-tight mt-0.5 truncate opacity-80">{course.room}</p>
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
