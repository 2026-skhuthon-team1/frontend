import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30000,
})

// ─── 백엔드 연동 가이드 ───────────────────────────────────────────
//
// [1] URL 확인
//   Swagger에서 수강 이력(엑셀) 업로드 API 주소를 복사해서
//   아래 api.post('/transcript/upload', ...) 의 첫 번째 인자를 교체한다.
//
// [2] 받는 데이터(Response) 처리
//   Swagger의 Response 탭에서 서버가 뭘 돌려주는지 확인한다.
//   특히 completedCourseCodes(이수 과목코드 목록) 필드명이 다르면
//   useAnalyzeUpload.js 의 onSuccess 안에서 맞춰주면 된다.
// ─────────────────────────────────────────────────────────────────
export const uploadTranscript = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/transcript/upload', formData).then((r) => r.data)
}
