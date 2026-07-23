import { api } from './client'

// GET /courses/offerings — DB의 전체 개설 강좌(강의 시간 포함). 전공 목록(useMajorOptions) 도출에 쓴다.
export const getOfferings = () => api.get('/courses/offerings').then((r) => r.data)

// GET /courses/general-required-offerings — 1학년 교양필수 강좌만(교수/분반/시간 포함). CourseSelectPage가 쓴다.
export const getGeneralRequiredOfferings = () =>
  api.get('/courses/general-required-offerings').then((r) => r.data)

// GET /courses/selectable-offerings?studentMajors=..&studentMajors=.. — 선택 전공의 전필/전선 + 전체 교양.
// Spring @RequestParam List<String>는 studentMajors를 반복 파라미터로 받으므로 URLSearchParams로 브래킷 없이 직렬화한다.
// (studentMajors는 최대 2개, 서버 저장값 원본 바이트 그대로 보낸다 — useMajorOptions의 raw value)
export const getSelectableOfferings = (studentMajors) => {
  const params = new URLSearchParams()
  studentMajors.forEach((m) => params.append('studentMajors', m))
  return api.get('/courses/selectable-offerings', { params }).then((r) => r.data)
}

// POST /courses/candidates — CourseCandidateRequestDto{studentMajors, studentYear, completedCourseCodes}로
// 수강 가능한 후보 개설 강좌를 조회한다. (아직 이 목록을 보여주는 화면은 없음 — 엔드포인트만 확보)
export const getCandidateOfferings = (payload) =>
  api.post('/courses/candidates', payload).then((r) => r.data)
