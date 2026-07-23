import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTimetableStore, FRESHMAN_MAJOR_CREDIT_CAP } from '../store/timetableStore'
import {
  generateTimetable,
  generateFirstYearFirstSemester,
  generateFirstYearSecondSemester,
} from '../api/timetable'

export function useTimetableInput() {
  const navigate = useNavigate()
  const store = useTimetableStore()

  const mutation = useMutation({
    // 1학년 1학기: 엑셀 없이 첫학기 전용 API. 1학년 2학기: 성적표 곁들인 둘째학기 전용 API.
    // 그 외 학년: 성적표 곁들인 /timetables/generate.
    mutationFn: ({ mode, payload, file }) => {
      if (mode === 'freshman1') return generateFirstYearFirstSemester(payload)
      if (mode === 'freshman2') return generateFirstYearSecondSemester(payload, file)
      return generateTimetable(payload, file)
    },
    // 응답은 추천 조합 배열을 그대로 내려준다({ candidates: [] }로 감싸져 있지 않음). 0개면 결과 없음 화면.
    // 아직 3개로 안 추려져서 올 수 있어 상위 3개만 자른다(백엔드가 3개 선별을 붙이면 이 slice는 지워도 됨).
    onSuccess: (data) => {
      store.setCombinations(data.slice(0, 3))
      navigate(data.length > 0 ? '/result' : '/result/empty')
    },
    onError: (e) => console.error(e.response?.data?.message ?? '오류가 발생했습니다.'),
  })

  const submit = () => {
    // 1학년(1·2학기) 공통: FirstYearTimetableRequestDto. studentYear는 백엔드가 1로 고정하므로 안 보낸다.
    // 전공탐색은 6학점까지만 존재하므로 요청 학점을 캡해 back-fill(상위 학년 전공 혼입)을 막는다.
    if (store.firstYearFirstSemester || store.firstYearSecondSemester) {
      const firstYearPayload = {
        studentMajors: store.majors,
        targetMajorCredits: Math.min(store.majorCredits, FRESHMAN_MAJOR_CREDIT_CAP),
        targetGeneralCredits: store.generalCredits,
        freeDays: store.offDays,
        excludeFirstPeriod: store.avoidFirstClass,
        fixedCourses: store.fixedCourses,
      }
      if (store.firstYearFirstSemester) {
        mutation.mutate({ mode: 'freshman1', payload: firstYearPayload })
        return
      }
      // 1학년 2학기는 1학기 성적표가 필요하다 — 없으면 업로드 화면으로 되돌린다
      if (!store.transcriptFile) {
        navigate('/upload')
        return
      }
      mutation.mutate({ mode: 'freshman2', payload: firstYearPayload, file: store.transcriptFile })
      return
    }

    // 2~4학년: 성적표 필수. completedCourseCodes는 백엔드가 엑셀에서 직접 파싱해 제외한다.
    if (!store.transcriptFile) {
      navigate('/upload')
      return
    }
    mutation.mutate({
      mode: 'normal',
      payload: {
        studentMajors: store.majors,
        studentYear: store.grade,
        targetMajorCredits: store.majorCredits,
        targetGeneralCredits: store.generalCredits,
        freeDays: store.offDays,
        excludeFirstPeriod: store.avoidFirstClass,
        includeSocialService: store.includeSocialService,
        fixedCourses: [],
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
