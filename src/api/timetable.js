import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30000,
})

// ─── 백엔드 연동 가이드 ───────────────────────────────────────────
//
// [1] URL 확인
//   Swagger에서 시간표 생성 API의 주소를 복사해서
//   아래 api.post('/timetable/generate', ...) 의 첫 번째 인자를 교체한다.
//   예) /api/v1/schedule/create 라면 → api.post('/v1/schedule/create', ...)
//
// [2] 보내는 데이터(Request Body) 필드명 맞추기
//   지금 프론트에서 보내는 데이터:
//     { credits, grade, offDays, avoidFirstClass }
//   Swagger의 Request Body 탭에서 백엔드가 기대하는 필드명과 비교한다.
//   이름이 다르면 useTimetableInput.js 의 mutation.mutate({...}) 안에서 바꿔주면 된다.
//   예) 백엔드가 offDays 대신 preferredOffDays 를 원하면:
//     mutation.mutate({ credits, grade, preferredOffDays: offDays, avoidFirstClass })
//
// [3] 받는 데이터(Response) 처리
//   Swagger의 Response 탭에서 서버가 뭘 돌려주는지 확인한다.
//   그 다음 useTimetableInput.js 의 onSuccess: (data) => ... 에서 data를 사용하면 된다.
//   예) 서버가 { timetableId: 42 } 를 돌려주면:
//     onSuccess: (data) => navigate(`/result/${data.timetableId}`)
//
// [4] 로그인 토큰 붙이기 (로그인 기능 생기면 그때 추가)
//   api 변수 선언 바로 아래에 이 코드를 추가하면
//   모든 요청에 자동으로 토큰이 붙는다:
//     api.interceptors.request.use(config => {
//       config.headers.Authorization = `Bearer ${로그인_토큰}`
//       return config
//     })
// ─────────────────────────────────────────────────────────────────
export const generateTimetable = (preferences) =>
  api.post('/timetable/generate', preferences).then((r) => r.data)
