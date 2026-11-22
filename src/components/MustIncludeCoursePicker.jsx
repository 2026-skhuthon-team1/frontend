import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOfferings, getSelectableOfferings } from '../api/courses'
import { fixMojibake } from '../utils/mojibake'

const MAX_RESULTS = 30
const MAJOR_CATEGORIES = ['전공필수', '전공선택', '전공탐색']
const GENERAL_CATEGORY = '교양' // selectable-offerings가 주는 교양과 같은 범위(교양필수·채플·사회봉사는 제외)

const timeLabel = (offering) =>
  (offering.times ?? [])
    .map((t) => `${t.dayOfWeek} ${t.startTime.slice(0, 5)}~${t.endTime.slice(0, 5)}`)
    .join(', ')

const sectionLabel = (o) => `${fixMojibake(o.courseName)} (${o.sectionNo}분반)`
const normalize = (s) => fixMojibake(s ?? '').replace(/\s+/g, '').toLowerCase()

// 내 전공 과목 먼저 > 과목명이 검색어로 시작 > 과목명에 포함 > 교수명에만 포함. 같은 순위면 과목명이 짧은 순
const rankOf = (o, keyword) => {
  const name = normalize(o.courseName)
  const majorRank = MAJOR_CATEGORIES.includes(o.category) ? 0 : 1
  const matchRank = name.startsWith(keyword) ? 0 : name.includes(keyword) ? 1 : 2
  return majorRank * 3 + matchRank
}

// 검색 대상 강좌. 2학년 이상은 고른 전공의 전필·전선 + 교양(selectable-offerings),
// 1학년은 selectable-offerings에 전공탐색이 없어 전체 강좌에서 소속 학부 전공탐색 + 교양을 고른다(useExplorationCredits와 같은 기준).
// 검색할 수 없는 상태(전공·학부 미선택)면 disabledReason을, 아직 불러오는 중이면 pool을 null로 돌려준다.
function useSearchPool({ isFreshman, isFreeMajor, majors, departments }) {
  const needsSelection = majors.length === 0
  const selectable = useQuery({
    queryKey: ['courses', 'selectable', majors],
    queryFn: () => getSelectableOfferings(majors),
    enabled: !isFreshman && !needsSelection,
    staleTime: Infinity,
  })
  const all = useQuery({
    queryKey: ['courses', 'offerings'],
    queryFn: getOfferings,
    enabled: isFreshman,
    staleTime: Infinity,
  })

  if (needsSelection) {
    return { pool: [], disabledReason: isFreshman && !isFreeMajor ? '학부를 먼저 선택해 주세요' : '전공을 먼저 선택해 주세요' }
  }
  if (!isFreshman) return { pool: selectable.data ?? null, disabledReason: null }
  if (!all.data) return { pool: null, disabledReason: null }

  // 자유전공이 전공탐색 학부를 안 골랐으면 전체 학부가 후보다
  const pool = all.data.filter((o) =>
    o.category === GENERAL_CATEGORY
    || (o.category === '전공탐색' && (departments.length === 0 || departments.includes(o.sectionGroup)))
  )
  return { pool, disabledReason: null }
}

// 꼭 넣을 과목 — 선택한 전공(1학년은 학부)의 과목과 교양에서 과목명·교수명으로 찾아 분반 단위로 담는다.
// 백엔드(mustIncludeOfferingIds)는 담은 과목을 모든 시간표에 넣고, 같은 과목의 분반을 여러 개 담으면 그중 하나를 넣는다.
export default function MustIncludeCoursePicker({ values, removedNames, onToggle, onRemove, isFreshman, isFreeMajor, majors, departments }) {
  const [query, setQuery] = useState('')
  const { pool, disabledReason } = useSearchPool({ isFreshman, isFreeMajor, majors, departments })

  // 전공을 바꿔 이미 담은 분반이 새 검색 대상에 없으면 담은 목록에서 빼고 알려 준다(불러오는 중엔 판단하지 않는다)
  // 빠지는 분반의 이름은 아직 pool에 없으니, 담을 때 기억해 둔 이름을 쓴다
  const [labels, setLabels] = useState({})
  const removedIds = pool ? values.filter((id) => !pool.some((o) => o.offeringId === id)) : []
  const removedKey = removedIds.join(',')
  useEffect(() => {
    if (!removedKey) return
    const ids = removedKey.split(',').map(Number)
    onRemove(ids, ids.map((id) => labels[id] ?? `강좌 ${id}`))
  }, [removedKey, onRemove, labels])

  const keyword = query.trim().replace(/\s+/g, '').toLowerCase()
  const matches = keyword && pool
    ? pool
        .filter((o) => !values.includes(o.offeringId))
        .filter((o) => `${normalize(o.courseName)}${normalize(o.professor)}`.includes(keyword))
        .sort((a, b) =>
          rankOf(a, keyword) - rankOf(b, keyword)
          || normalize(a.courseName).length - normalize(b.courseName).length
          || fixMojibake(a.courseName).localeCompare(fixMojibake(b.courseName), 'ko'))
    : []
  const results = matches.slice(0, MAX_RESULTS)
  const hiddenCount = matches.length - results.length
  const selected = values.map((id) => pool?.find((o) => o.offeringId === id)).filter(Boolean)

  const add = (o) => {
    setLabels((prev) => ({ ...prev, [o.offeringId]: sectionLabel(o) }))
    onToggle(o.offeringId)
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-2 w-[420px]">
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={!!disabledReason}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabledReason ?? '과목명 또는 교수명으로 검색'}
          className="w-full h-14 rounded-xl border-2 border-[#e2e8f0] bg-white px-4 text-base font-medium text-[#314158] placeholder:text-[#90a1b9] focus:outline-none focus:border-[#7ccf00] disabled:bg-[#f8fafc] disabled:cursor-not-allowed transition-colors"
        />
        {keyword && !disabledReason && (
          <ul className="absolute z-10 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white shadow-lg">
            {!pool ? (
              <li className="px-4 py-3 text-sm text-[#90a1b9]">과목을 불러오는 중이에요</li>
            ) : results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#90a1b9]">검색 결과가 없어요</li>
            ) : (
              <>
                {results.map((o) => (
                  <li key={o.offeringId}>
                    <button
                      type="button"
                      onClick={() => add(o)}
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
                ))}
                {hiddenCount > 0 && (
                  <li className="px-4 py-2.5 text-xs text-[#90a1b9] border-t border-[#f1f5f9]">
                    결과 {hiddenCount}개 더 있어요. 검색어를 더 자세히 입력해 보세요.
                  </li>
                )}
              </>
            )}
          </ul>
        )}
      </div>
      {removedNames.length > 0 && (
        <p role="status" className="text-xs text-[#9f2d00]">
          선택한 전공에 없는 과목이라 담은 목록에서 뺐어요: {removedNames.join(', ')}
        </p>
      )}
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
