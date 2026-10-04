import { create } from 'zustand';

export const useAppStore = create((set) => ({
  analyzing: false,
  progress: 0,
  doneSteps: 0,
  activeStep: -1,
  analyzed: false,

  startAnalysis: () => set({ analyzing: true }),
  setProgress: (progress) => set({ progress }),
  setDoneSteps: (doneSteps) => set({ doneSteps }),
  setActiveStep: (activeStep) => set({ activeStep }),
  finishAnalysis: () => set({ analyzed: true, activeStep: -1 }),
  // 분석 화면에 들어올 때마다 호출 — 이전에 올린 파일의 100% 진행률이 남지 않게 처음 상태로 되돌린다
  resetAnalysis: () => set({ analyzing: false, progress: 0, doneSteps: 0, activeStep: -1, analyzed: false }),
}));
