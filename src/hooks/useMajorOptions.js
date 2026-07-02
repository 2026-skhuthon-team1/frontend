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

  const rawMajors = [...new Set(offerings.map((o) => o.sectionGroup).filter(Boolean))]

  return rawMajors
    .map((value) => ({ value, label: fixMojibake(value) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
}
