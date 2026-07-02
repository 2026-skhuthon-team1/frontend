import { create } from 'zustand'

export const useTimetableStore = create((set) => ({
  majorCredits: 12,
  generalCredits: 6,
  grade: 2,
  offDays: ['금'],
  avoidFirstClass: true,
  includeSocialService: false,
  majors: [],
  transcriptFile: null, // /upload에서 선택한 엑셀 원본 파일 — /input 제출 시 조건과 함께 /timetables/generate로 전송
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
  setCombinations: (combinations) => set({ combinations }),
}))
