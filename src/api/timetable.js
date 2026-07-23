import { api } from './client'

// POST /timetables/generate — 엑셀 파일과 조건을 함께 보내면
// 백엔드가 파일을 파싱(이수 과목 확인)하고 AI가 추천 조합을 만들어 candidates로 돌려준다.
// request 파트는 JSON Blob으로 감싸야 백엔드가 application/json 파트로 인식한다.
export const generateTimetable = (payload, file) => {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  formData.append('file', file)
  return api.post('/timetables/generate', formData).then((r) => r.data)
}

// POST /timetables/first-year/second-semester — 1학년 2학기: 조건(JSON) + 1학기 성적 엑셀을 함께 보낸다.
// 응답은 /generate와 동일한 추천(courses[]) 모양.
// ponytail: 현재 2학기 흐름도 generateTimetable(/generate)로 처리되고 있어 아직 미연결. 전용 랭킹이 필요해지면 이걸로 교체.
export const generateFirstYearSecondSemester = (payload, file) => {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  formData.append('file', file)
  return api.post('/timetables/first-year/second-semester', formData).then((r) => r.data)
}

// TimetableCombinationResponseDto(1학년/조합 응답)의 offerings[]를
// TimetableRecommendationResponseDto의 courses[] 모양으로 맞춰서
// TimetableResultPage.jsx의 toCard()가 두 응답을 구분 없이 처리하게 한다.
// (offerings[].times[]는 room이 시간 항목마다 있어 첫 시간의 room을 과목 room으로 쓴다 — 보통 같은 강의실이라 문제 없음)
const toGenerateShape = (combo) => ({
  timetableId: combo.timetableId,
  courses: (combo.offerings ?? []).map((o) => ({
    courseName: o.courseName,
    category: o.category,
    professor: o.professor,
    credits: o.credits,
    room: o.times?.[0]?.room,
    times: (o.times ?? []).map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })),
  })),
})

// POST /timetables/first-year/first-semester — 1학년 1학기는 이수 과목이 없어 엑셀이 필요 없다.
// 조건(JSON)만 보내면 백엔드가 교양필수·전공탐색 강좌로 시간표를 짜서 돌려준다.
export const generateFirstYearFirstSemester = (payload) =>
  api.post('/timetables/first-year/first-semester', payload).then((r) => r.data.map(toGenerateShape))

// POST /timetables/combinations — 엑셀/AI 없이 조건(TimetableCombinationRequestDto)만으로 시간표 조합을 생성한다.
// 응답은 1학년 응답과 같은 offerings[] 모양이라 카드용 courses[]로 맞춰준다. (엔드포인트만 확보 — 현재 /result는 AI /generate를 씀)
export const generateCombinations = (payload) =>
  api.post('/timetables/combinations', payload).then((r) => r.data.map(toGenerateShape))
