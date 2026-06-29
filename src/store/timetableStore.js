import { create } from 'zustand'

export const useTimetableStore = create((set) => ({
  credits: 18,
  grade: 2,
  offDays: ['금'],
  avoidFirstClass: true,

  setCredits: (credits) => set({ credits }),
  setGrade: (grade) => set({ grade }),
  toggleOffDay: (day) =>
    set((s) => ({
      offDays: s.offDays.includes(day)
        ? s.offDays.filter((d) => d !== day)
        : [...s.offDays, day],
    })),
  setAvoidFirstClass: (v) => set({ avoidFirstClass: v }),
}))
