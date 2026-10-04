import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 1학년(1·2학기)은 전공탐색만 수강 가능하고 학부당 개설이 6학점뿐이라, 이보다 크게 요청하면
// 백엔드가 상위 학년 전공으로 목표학점을 채운다(back-fill). 프론트에서 6으로 캡해 그걸 막는다.
export const FRESHMAN_MAJOR_CREDIT_CAP = 6

// 자유전공은 1학년에만 있는 소속이다. 백엔드는 이 이름으로 자유전공 학생을 구분하고(CourseCandidateProvider.FREE_MAJOR_GROUP_NAMES),
// 함께 보낸 학부를 전공탐색 후보로 쓴다 — 학부를 안 보내면 전체 학부가 후보가 된다.
export const FREE_MAJOR = '자유전공학부'

export const useTimetableStore = create(persist((set) => ({
  majorCredits: 12,
  generalCredits: 6,
  grade: 2,
  offDays: ['금'],
  avoidFirstClass: true,
  includeSocialService: false,
  majors: [],
  explorationDepartments: [], // 자유전공 1학년이 전공탐색 후보로 고른 학부 — 제출 시 studentMajors에 자유전공학부와 함께 실어 보낸다
  transcriptFile: null, // /upload에서 선택한 엑셀 원본 파일 — /input 제출 시 조건과 함께 /timetables/generate로 전송
  firstYearFirstSemester: false, // CourseSelectPage에서 "1학년 1학기입니다" 선택 시 true — /input 제출 시 엑셀 없이 /timetables/first-year/first-semester로 전송
  firstYearSecondSemester: false, // "1학년 2학기입니다" 선택 시 true — 성적표 업로드 후 /input 제출 시 /timetables/first-year/second-semester로 전송
  fixedCourses: [], // CourseSelectPage에서 고른 교양필수 분반 — {courseName, professor, day, start, end}(GeneralRequiredCourseSelectionDto 모양)로 FirstYearTimetableRequestDto.fixedCourses에 전송
  combinations: [], // POST /timetables/generate 응답의 candidates — /result 페이지가 이 값을 읽어서 렌더링

  setMajorCredits: (majorCredits) => set({ majorCredits }),
  // 1학년 플로우 진입 시 호출 — 학년을 1로 고정하고(신입생은 학년 선택 UI가 없어 기본값 2로 남는 걸 막는다),
  // 저장된 전공 학점을 전공탐색 상한(6)으로 낮춰 입력·요청·결과 요약이 모두 1학년 조건과 일치하게 한다.
  // 1학년은 전공이 아니라 학부를 고르므로, 이전에 고른 전공은 비우고 자유전공 답변이면 학부를 자유전공학부로 정해 둔다.
  applyFreshmanDefaults: (isFreeMajor) => set((s) => ({
    grade: 1,
    majorCredits: Math.min(s.majorCredits, FRESHMAN_MAJOR_CREDIT_CAP),
    majors: isFreeMajor ? [FREE_MAJOR] : [],
    explorationDepartments: [],
  })),
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
  // 1학년 학부는 하나만 고른다 — 같은 학부를 다시 누르면 선택 해제
  toggleDepartment: (d) =>
    set((s) => ({
      majors: s.majors.includes(d) ? [] : [d],
      explorationDepartments: [],
    })),
  toggleExplorationDepartment: (d) =>
    set((s) => ({
      explorationDepartments: s.explorationDepartments.includes(d)
        ? s.explorationDepartments.filter((x) => x !== d)
        : [...s.explorationDepartments, d],
    })),
  // 2학년 이상 흐름 진입 시 호출 — 자유전공은 1학년 전용이라 남아 있으면 지운다
  dropFreeMajor: () => set((s) => ({ majors: s.majors.filter((m) => m !== FREE_MAJOR), explorationDepartments: [] })),
  setTranscriptFile: (transcriptFile) => set({ transcriptFile }),
  setFirstYearFirstSemester: (v) => set({ firstYearFirstSemester: v }),
  setFirstYearSecondSemester: (v) => set({ firstYearSecondSemester: v }),
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
