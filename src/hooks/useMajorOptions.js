import { useQuery } from '@tanstack/react-query'
import { getOfferings } from '../api/courses'
import { fixMojibake } from '../utils/mojibake'

// 전공선택/전공필수 과목의 sectionGroup 필드가 실제 전공명이다 (교양 과목은 null).
// 화면엔 복원한 한글을 보여주고, 서버로 보낼 때는 원본(깨진) 값을 그대로 써야
// 백엔드에 저장된 값과 바이트가 일치해서 매칭이 된다.
export function useMajorOptions() {
  const { data: offerings = [] } = useQuery({
    queryKey: ['courses', 'offerings'],
    queryFn: getOfferings,
    staleTime: Infinity,
  })

  return toOptions(offerings.map((o) => o.sectionGroup))
}

// 1학년 학부 목록 — 전공탐색 과목의 sectionGroup이 학부명이다(전공명은 섞이지 않는다).
export function useDepartmentOptions() {
  const { data: offerings = [] } = useQuery({
    queryKey: ['courses', 'offerings'],
    queryFn: getOfferings,
    staleTime: Infinity,
  })

  return toOptions(offerings.filter((o) => o.category === '전공탐색').map((o) => o.sectionGroup))
}

// 고른 학부들의 전공탐색 개설 학점 합. 같은 과목이 여러 학부에 개설돼도(예: Python프로그래밍) 한 번만 센다.
// departments가 비어 있으면 전체 학부 기준이고, 강좌 목록을 아직 받지 못했으면 null을 돌려준다.
export function useExplorationCredits(departments) {
  const { data: offerings } = useQuery({
    queryKey: ['courses', 'offerings'],
    queryFn: getOfferings,
    staleTime: Infinity,
  })
  if (!offerings) return null

  const creditsByCourse = new Map()
  offerings
    .filter((o) => o.category === '전공탐색' && (departments.length === 0 || departments.includes(o.sectionGroup)))
    .forEach((o) => creditsByCourse.set(o.courseCode, o.credits ?? 0))

  return [...creditsByCourse.values()].reduce((sum, credits) => sum + credits, 0)
}

const toOptions = (rawValues) =>
  [...new Set(rawValues.filter(Boolean))]
    .map((value) => ({ value, label: fixMojibake(value) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
