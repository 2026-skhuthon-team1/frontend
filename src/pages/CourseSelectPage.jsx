import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TopBar from '../components/TopBar';
import { useTimetableStore } from '../store/timetableStore';
import { getGeneralRequiredOfferings } from '../api/courses';
import { fixMojibake } from '../utils/mojibake';

// 1학년 1학기 필수 교양 5과목 — GET /courses/general-required-offerings 응답의 courseName과 정확히 일치해야 분반을 찾을 수 있다
// 대학생활세미나는 전원 필수 수강이라 "안 듣습니다"로 뺄 수 없다
const FIXED_COURSES = [
  { name: '대학생활세미나', color: 'blue', excludable: false },
  { name: '말과글', color: 'purple', excludable: true },
  { name: '인권과평화', color: 'orange', excludable: true },
  { name: '과학기술과에콜로지', color: 'teal', excludable: true },
  { name: '디지털리터러시', color: 'pink', excludable: true },
];

const NUM_COLOR = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-pink-50 text-pink-600',
};

const timeLabel = (offering) =>
  (offering.times ?? [])
    .map((t) => `${t.dayOfWeek} ${t.startTime.slice(0, 5)}~${t.endTime.slice(0, 5)}`)
    .join(', ');

function CourseRow({ name, color, excludable, index, sections, professor, offeringId, isExcluded, onSelectProfessor, onSelectOffering, onToggleExclude }) {
  const professors = [...new Set(sections.map((s) => s.professor))];
  const professorSections = sections.filter((s) => s.professor === professor);
  const hasMultipleSlots = professorSections.length > 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 flex items-center gap-4 transition">
      <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${NUM_COLOR[color]}`}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <p className="font-bold text-[15px] text-gray-800">{fixMojibake(name)}</p>

      <select
        value={professor}
        disabled={isExcluded}
        onChange={(e) => onSelectProfessor(name, e.target.value)}
        className="w-36 shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        <option value="">교수님 선택</option>
        {professors.map((p) => <option key={p} value={p}>{fixMojibake(p)}</option>)}
      </select>

      {hasMultipleSlots && (
        <select
          value={offeringId ?? ''}
          disabled={isExcluded}
          onChange={(e) => onSelectOffering(name, Number(e.target.value))}
          className="shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          {professorSections.map((s) => <option key={s.offeringId} value={s.offeringId}>{timeLabel(s)}</option>)}
        </select>
      )}

      {excludable && (
        <button
          onClick={() => onToggleExclude(name)}
          className={`ml-auto shrink-0 px-4 py-2 rounded-lg text-[13px] font-bold transition ${
            isExcluded
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}>
          이 과목은 안 듣습니다
        </button>
      )}
    </div>
  );
}

export default function CourseSelectPage() {
  const navigate = useNavigate();
  const setFirstYearFirstSemester = useTimetableStore((s) => s.setFirstYearFirstSemester);
  const setFirstYearSecondSemester = useTimetableStore((s) => s.setFirstYearSecondSemester);
  const setFixedCourses = useTimetableStore((s) => s.setFixedCourses);
  const clampFreshmanMajorCredits = useTimetableStore((s) => s.clampFreshmanMajorCredits);
  // 전체 카탈로그를 받아 걸러내는 대신, 1학년 교양필수만 주는 전용 엔드포인트를 쓴다
  const { data: offerings = [] } = useQuery({
    queryKey: ['courses', 'general-required'],
    queryFn: getGeneralRequiredOfferings,
    staleTime: Infinity,
  });

  // 과목별 선택 상태 — professor 미선택 시 offeringId는 null
  const [selections, setSelections] = useState(() =>
    Object.fromEntries(FIXED_COURSES.map((c) => [c.name, { professor: '', offeringId: null }]))
  );
  const [excluded, setExcluded] = useState([]);

  const toggleExclude = (name) =>
    setExcluded((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]);

  // 교수님을 바꾸면 그 교수님의 분반 목록이 통째로 달라지므로, 분반이 하나면 바로 그걸로 확정하고
  // 여러 개면 일단 비워뒀다가 아래 select에서 고르게 한다
  const selectProfessor = (name, professor) => {
    const sections = offerings.filter((o) => o.courseName === name && o.professor === professor);
    setSelections((prev) => ({
      ...prev,
      [name]: { professor, offeringId: sections.length === 1 ? sections[0].offeringId : null },
    }));
  };

  const selectOffering = (name, offeringId) =>
    setSelections((prev) => ({ ...prev, [name]: { ...prev[name], offeringId } }));

  // 제외하지 않고 분반까지 확정한 과목만 백엔드 GeneralRequiredCourseSelectionDto 모양으로 보낸다.
  // offering 객체를 통째로 보내면 시간이 times[] 안에 중첩돼 백엔드엔 day/start/end=null로 도착하고,
  // 그러면 같은 교수의 분반이 여러 개일 때(예: 말과글 오현화 4분반) 백엔드가 첫 분반을 임의로 골라
  // 사용자가 고른 시간이 무시된다. 그래서 선택 분반의 첫 강의시간을 day/start/end로 풀어서 보낸다.
  const buildFixedCourses = () =>
    FIXED_COURSES.filter((c) => !excluded.includes(c.name) && selections[c.name].offeringId != null)
      .map((c) => offerings.find((o) => o.offeringId === selections[c.name].offeringId))
      .filter(Boolean)
      .map((o) => ({
        courseName: o.courseName,
        professor: o.professor,
        day: o.times?.[0]?.dayOfWeek,
        start: o.times?.[0]?.startTime,
        end: o.times?.[0]?.endTime,
      }));

  // 두 학기 모두 여기서 고른 교양필수 분반을 그대로 넘기고, 전공 학점을 전공탐색 상한(6)으로 낮춘다.
  // 플래그는 상호배타로 정리한다.
  const startAsFirstSemester = () => {
    setFixedCourses(buildFixedCourses());
    clampFreshmanMajorCredits();
    setFirstYearSecondSemester(false);
    setFirstYearFirstSemester(true);
    navigate('/input');
  };

  // 1학년 2학기는 1학기 성적표가 필요하므로 업로드 화면(/courses/second-semester)을 먼저 거친다.
  // 둘째학기 플래그는 그 화면(AnalyzePage)에서 성적표 등록이 끝날 때 켜진다.
  const startAsSecondSemester = () => {
    setFixedCourses(buildFixedCourses());
    clampFreshmanMajorCredits();
    setFirstYearFirstSemester(false);
    navigate('/courses/second-semester');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="max-w-[960px] mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-bold text-primary-600 bg-primary-100 px-2.5 py-1 rounded-full">STEP 02</span>
            <h1 className="text-2xl font-bold text-gray-800">필수 교양 과목 시간 설정</h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {FIXED_COURSES.map((course, i) => (
            <CourseRow
              key={course.name}
              name={course.name}
              color={course.color}
              excludable={course.excludable}
              index={i}
              sections={offerings.filter((o) => o.courseName === course.name)}
              professor={selections[course.name].professor}
              offeringId={selections[course.name].offeringId}
              isExcluded={excluded.includes(course.name)}
              onSelectProfessor={selectProfessor}
              onSelectOffering={selectOffering}
              onToggleExclude={toggleExclude}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4">
          <p className="text-sm text-gray-500">
            설정한 과목과 시간대를 기반으로 AI가 최적의 전체 시간표 조합을 생성해요.
          </p>
          <div className="ml-auto flex gap-3">
            <button onClick={startAsFirstSemester}
              className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              1학년 1학기입니다
            </button>
            <button onClick={startAsSecondSemester}
              className="px-6 py-3 text-sm font-bold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition">
              1학년 2학기입니다
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        © 2026 시간표짜조. All academic data is processed securely.
      </footer>
    </div>
  );
}
