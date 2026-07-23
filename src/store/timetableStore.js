import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTimetableStore = create(persist((set) => ({
  majorCredits: 12,
  generalCredits: 6,
  grade: 2,
  offDays: ['금'],
  avoidFirstClass: true,
  includeSocialService: false,
  majors: [],
  transcriptFile: null, // /upload에서 선택한 엑셀 원본 파일 — /input 제출 시 조건과 함께 /timetables/generate로 전송
  firstYearFirstSemester: false, // CourseSelectPage에서 "1학년 1학기입니다" 선택 시 true — /input 제출 시 엑셀 없이 /timetables/first-year/first-semester로 전송
  fixedCourses: [], // CourseSelectPage에서 고른 교양필수 분반(GET /courses/offerings 응답 그대로) — FirstYearTimetableRequestDto.fixedCourses로 전송
  combinations: [], // POST /timetables/generate 응답의 candidates — /result 페이지가 이 값을 읽어서 렌더링

  setMajorCredits: (majorCredits) => set({ majorCredits }),
  setGeneralCredits: (generalCredits) => set({ generalCredits }),
  setGrade: (grade) => set({ grade }),
  toggleOffDay: (day) =>
    set((s) => ({
      offDays: s.offDays.includes(day)
        ? s.offDays.filter((d) => d !== day)
        : [...s.offDays, day],
    })),
  setAvoidFirstClass: (v) => set({ avoidFirstClass: v }),
  setIncludeSocialService: (v) => set({ includeSocialService: v }),
  toggleMajor: (m) =>
    set((s) => ({
      majors: s.majors.includes(m)
        ? s.majors.filter((x) => x !== m)
        : [...s.majors, m],
    })),
  setTranscriptFile: (transcriptFile) => set({ transcriptFile }),
  setFirstYearFirstSemester: (v) => set({ firstYearFirstSemester: v }),
  setFixedCourses: (fixedCourses) => set({ fixedCourses }),
  setCombinations: (combinations) => set({ combinations }),
}), {
  name: 'timetable-result',
  // transcriptFile은 File 객체라 직렬화 불가 — 저장 제외.
  // /result 새로고침 시 결과(combinations)와 요약 헤더가 읽는 조건 필드까지 복구한다.
  // avoidFirstClass는 toCard 카드 생성에도 쓰여 빠지면 카드가 달라진다.
  partialize: (s) => ({
    combinations: s.combinations,
    avoidFirstClass: s.avoidFirstClass,
    majors: s.majors,
    majorCredits: s.majorCredits,
    generalCredits: s.generalCredits,
    grade: s.grade,
    offDays: s.offDays,
  }),
}))
