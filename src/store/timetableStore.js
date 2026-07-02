import { create } from 'zustand'

export const useTimetableStore = create((set) => ({
  majorCredits: 12,
  generalCredits: 6,
  grade: 2,
  offDays: ['금'],
  avoidFirstClass: true,
  includeSocialService: false,
  majors: [],
  completedCourseCodes: [], // 엑셀 업로드로 받아온 이수 과목코드 — /courses/candidates 호출 시 사용

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
  setCompletedCourseCodes: (completedCourseCodes) => set({ completedCourseCodes }),
}))
