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

const toOptions = (rawValues) =>
  [...new Set(rawValues.filter(Boolean))]
    .map((value) => ({ value, label: fixMojibake(value) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
