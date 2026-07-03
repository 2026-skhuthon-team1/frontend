import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTimetableStore } from '../store/timetableStore'
import { generateTimetable } from '../api/timetable'

export function useTimetableInput() {
  const navigate = useNavigate()
  const store = useTimetableStore()

  const mutation = useMutation({
    mutationFn: ({ payload, file }) => generateTimetable(payload, file),
    // 응답은 AiTimetableDto[] 배열을 그대로 내려준다({ candidates: [] }로 감싸져 있지 않음)
    // 0개면 결과 없음 화면으로 보낸다
    // candidates가 아직 3개로 안 추려져서 올 수 있어 프론트에서 상위 3개만 자른다
    // (백엔드가 AI 3개 선별을 붙이면 이 slice는 지워도 됨)
    onSuccess: (data) => {
      console.log(data)
      store.setCombinations(data.slice(0, 3))
      navigate(data.length > 0 ? '/result' : '/result/empty')
    },
    onError: (e) => console.error(e.response?.data?.message ?? '오류가 발생했습니다.'),
  })

  // TimetableGenerateRequestDto 필드명에 맞춰 store 값을 매핑한다
  // completedCourseCodes는 백엔드가 엑셀 파일에서 직접 파싱해서 제외하므로 요청에 넣지 않는다
  // includeSocialService는 DTO에 없는 필드라 요청에서 제외한다
  const submit = () => {
    if (!store.transcriptFile) {
      navigate('/upload')
      return
    }
    mutation.mutate({
      payload: {
        studentMajors: store.majors,
        studentYear: store.grade,
        targetMajorCredits: store.majorCredits,
        targetGeneralCredits: store.generalCredits,
        freeDays: store.offDays,
        excludeFirstPeriod: store.avoidFirstClass,
      },
      file: store.transcriptFile,
    })
  }

  return {
    ...store,
    loading: mutation.isPending,
    error: mutation.error?.response?.data?.message ?? (mutation.isError ? '오류가 발생했습니다.' : null),
    submit,
  }
}
