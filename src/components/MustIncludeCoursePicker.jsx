import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOfferings } from '../api/courses'
import { fixMojibake } from '../utils/mojibake'

const MAX_RESULTS = 8

const timeLabel = (offering) =>
  (offering.times ?? [])
    .map((t) => `${t.dayOfWeek} ${t.startTime.slice(0, 5)}~${t.endTime.slice(0, 5)}`)
    .join(', ')

const sectionLabel = (o) => `${fixMojibake(o.courseName)} (${o.sectionNo}분반)`

// 꼭 넣을 과목 — 전체 개설 강좌에서 과목명·교수명으로 찾아 분반 단위로 담는다.
// 백엔드(mustIncludeOfferingIds)는 담은 과목을 모든 시간표에 넣고, 같은 과목의 분반을 여러 개 담으면 그중 하나를 넣는다.
// 전공·학년·이수 여부와 관계없이 고른 그대로 쓰므로 목록도 거르지 않는다.
export default function MustIncludeCoursePicker({ values, onToggle }) {
  const [query, setQuery] = useState('')
  const { data: offerings = [] } = useQuery({
    queryKey: ['courses', 'offerings'],
    queryFn: getOfferings,
    staleTime: Infinity,
  })

  const keyword = query.trim().replace(/\s+/g, '').toLowerCase()
  const results = keyword
    ? offerings
        .filter((o) => !values.includes(o.offeringId))
        .filter((o) =>
          `${fixMojibake(o.courseName)}${fixMojibake(o.professor ?? '')}`.replace(/\s+/g, '').toLowerCase().includes(keyword)
        )
        .slice(0, MAX_RESULTS)
    : []
  const selected = values.map((id) => offerings.find((o) => o.offeringId === id)).filter(Boolean)

  const add = (offeringId) => {
    onToggle(offeringId)
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-2 w-[420px]">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="과목명 또는 교수명으로 검색"
          className="w-full h-14 rounded-xl border-2 border-[#e2e8f0] bg-white px-4 text-base font-medium text-[#314158] placeholder:text-[#90a1b9] focus:outline-none focus:border-[#7ccf00] transition-colors"
        />
        {keyword && (
          <ul className="absolute z-10 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white shadow-lg">
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#90a1b9]">검색 결과가 없어요</li>
            ) : (
              results.map((o) => (
                <li key={o.offeringId}>
                  <button
                    type="button"
                    onClick={() => add(o.offeringId)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f7fee7] transition-colors"
                  >
                    <p className="text-sm font-bold text-[#1d293d]">
                      {sectionLabel(o)}
                      <span className="ml-2 text-xs font-medium text-[#90a1b9]">{o.category} · {o.credits}학점</span>
                    </p>
                    <p className="text-xs text-[#62748e] mt-0.5">
                      {fixMojibake(o.professor ?? '')}{o.times?.length ? ` · ${timeLabel(o)}` : ''}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((o) => (
            <button
              key={o.offeringId}
              type="button"
              onClick={() => onToggle(o.offeringId)}
              title={`${fixMojibake(o.professor ?? '')} ${timeLabel(o)}`}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#f7fee7] border border-[#7ccf00] text-[#5ea500] text-sm font-medium hover:bg-[#ecfcca] transition-colors"
            >
              {sectionLabel(o)}
              <span className="text-[#90a1b9] leading-none">✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
