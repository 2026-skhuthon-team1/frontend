import axios from 'axios'

// 모든 API 호출이 공유하는 axios 인스턴스.
// 개발 서버에서는 /api 프록시(vite.config.js)가, 배포에서는 VITE_API_BASE_URL이 백엔드로 중계한다.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30000,
})
