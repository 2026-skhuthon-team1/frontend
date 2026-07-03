import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTimetableStore } from '../store/timetableStore'
import { generateTimetable, generateFirstYearFirstSemester } from '../api/timetable'

export function useTimetableInput() {
  const navigate = useNavigate()
  const store = useTimetableStore()

  const mutation = useMutation({
    // file이 있으면 엑셀을 곁들이는 /timetables/generate, 없으면(1학년 1학기) 엑셀 없는 첫학기 전용 API를 쓴다
    mutationFn: ({ payload, file }) =>
      console.log('payload', payload) ||
      file ? generateTimetable(payload, file) : generateFirstYearFirstSemester(payload),
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
  // generalRequiredCourses(필수 교양 과목 코드)는 아직 이걸 고르는 화면이 store에 연결돼 있지 않아 빈 배열로 보낸다
  const submit = () => {
    // 1학년 1학기는 성적표가 없다 — FirstYearTimetableRequestDto 필드명에 맞춰 별도로 보낸다
    if (store.firstYearFirstSemester) {
      mutation.mutate({
        payload: {
          studentMajors: store.majors,
          targetMajorCredits: store.majorCredits,
          targetGeneralCredits: store.generalCredits,
          freeDays: store.offDays,
          excludeFirstPeriod: store.avoidFirstClass,
          fixedCourses: store.fixedCourses,
        },
      })
      return
    }

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
        includeSocialService: store.includeSocialService,
        generalRequiredCourses: [],
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
