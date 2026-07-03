import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30000,
})

// POST /timetables1/generate — 엑셀 파일과 조건을 함께 보내면
// 백엔드가 파일을 파싱(이수 과목 확인)하고 AI가 추천 조합을 만들어 candidates로 돌려준다.
// request 파트는 JSON Blob으로 감싸야 백엔드가 application/json 파트로 인식한다.
export const generateTimetable = (payload, file) => {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  formData.append('file', file)
  return api.post('/timetables/generate', formData).then((r) => r.data)
}
