import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTimetableStore } from '../store/timetableStore'
import { generateTimetable } from '../api/timetable'

/**
 * 백엔드 Swagger 연동 방법:
 * 1. Swagger에서 응답 스키마 확인 후 onSuccess의 data 처리 수정
 *    예) 서버가 { timetableId, combinations } 를 반환하면:
 *    onSuccess: (data) => navigate(`/result/${data.timetableId}`)
 * 2. 에러 코드별 처리가 필요하면 onError에서 e.response.status로 분기
 *    예) 401 → 로그인 페이지로 이동, 400 → 입력값 재확인 메시지
 */
export function useTimetableInput() {
  const navigate = useNavigate()
  const store = useTimetableStore()
// swaager의 response 스키마에 맞게 onSuccess에서 data 처리 수정 필요 시 아래 mutation 선언에서 바꿔주면 됨
  const mutation = useMutation({
    mutationFn: generateTimetable,
    onSuccess: () => navigate('/result'), // 엔드포인트 필요시 수정
// API가 실제로 붙으면 성공 시 onSuccess가 이동시켜주니까, 에러 때도 강제로 이동하는 코드는 필요 없어져서 navigate('/result')를 지워야합니다.
    onError: (e) => { console.error(e.response?.data?.message ?? '오류가 발생했습니다.'); navigate('/result') },
  })
// swagger의 request body에 맞게 필드명 수정 필요 시 아래 submit()에서 바꿔주면 됨
  const submit = () =>
    mutation.mutate({
      credits: store.credits,
      grade: store.grade,
      offDays: store.offDays,
      avoidFirstClass: store.avoidFirstClass,
    })

  return {
    ...store,
    loading: mutation.isPending,
    error: mutation.error?.response?.data?.message ?? (mutation.isError ? '오류가 발생했습니다.' : null),
    submit,
  }
}
