import { create } from 'zustand';

export const useAppStore = create((set) => ({
  screen: 'login',
  goTo: (screen) => set({ screen }),

  loginId: '',
  loginPw: '',
  setLoginId: (loginId) => set({ loginId }),
  setLoginPw: (loginPw) => set({ loginPw }),

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
}));
