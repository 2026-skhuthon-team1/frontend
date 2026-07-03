import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useTimetableStore } from '../store/timetableStore';

const INITIAL_COURSES = [
  { id: 1, name: '대학생활세미나', color: 'blue', professor: '', slot: 0 },
  { id: 2, name: '말과글', color: 'purple', professor: '', slot: 0 },
  { id: 3, name: '인권과 평화', color: 'orange', professor: '', slot: 0 },
  { id: 4, name: '과학기술과에콜로지', color: 'teal', professor: '', slot: 0 },
  { id: 5, name: '디지털리터러시', color: 'pink', professor: '', slot: 0 },
]

const NUM_COLOR = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-pink-50 text-pink-600',
};

// 백엔드 /courses/offerings가 500을 던져서(분반 정보를 못 받아옴) 1학년 필수 교양 실제 분반표(수강신청 시간표)를 정적으로 박아둔다.
// 교수님마다 여는 요일/시간이 달라서(예: 말과글 오현화는 4개, 박주혜는 1개) 분반 단위로 갖고 있어야
// 교수님 선택 후 그 교수님이 실제로 여는 시간대만 보여줄 수 있다.
// 백엔드가 고쳐지면 이 목록은 지우고 /courses/offerings 조회로 되돌리면 된다.
const OFFERINGS = {
  '대학생활세미나': [
    { professor: '김혜인', day: '금', start: '13:00', end: '14:50' },
    { professor: '김아름', day: '금', start: '13:00', end: '14:50' },
    { professor: '윤영도', day: '금', start: '13:00', end: '14:50' },
    { professor: '송재민', day: '금', start: '13:00', end: '14:50' },
    { professor: '김용미', day: '금', start: '13:00', end: '14:50' },
    { professor: '황준서', day: '금', start: '13:00', end: '14:50' },
    { professor: '유철규', day: '금', start: '13:00', end: '14:50' },
    { professor: '김태경', day: '금', start: '13:00', end: '14:50' },
    { professor: '최정태', day: '금', start: '13:00', end: '14:50' },
    { professor: '윤장열', day: '금', start: '13:00', end: '14:50' },
    { professor: '이원정', day: '금', start: '13:00', end: '14:50' },
    { professor: '오세현', day: '금', start: '13:00', end: '14:50' },
    { professor: '김수림', day: '금', start: '13:00', end: '14:50' },
    { professor: '곽승우', day: '금', start: '13:00', end: '14:50' },
    { professor: '김선형', day: '금', start: '13:00', end: '14:50' },
    { professor: '김명철', day: '금', start: '13:00', end: '14:50' },
    { professor: '박정식', day: '금', start: '13:00', end: '14:50' },
    { professor: '김덕봉', day: '금', start: '13:00', end: '14:50' },
    { professor: '박남기', day: '금', start: '13:00', end: '14:50' },
    { professor: '김병수', day: '금', start: '13:00', end: '14:50' },
    { professor: '윤명호', day: '금', start: '13:00', end: '14:50' },
    { professor: '이해청', day: '금', start: '13:00', end: '14:50' },
    { professor: '김기명', day: '금', start: '13:00', end: '14:50' },
    { professor: '이현아', day: '금', start: '13:00', end: '14:50' },
  ],
  '말과글': [
    { professor: '오현화', day: '화', start: '09:00', end: '10:50' },
    { professor: '오현화', day: '화', start: '11:00', end: '12:50' },
    { professor: '오현화', day: '목', start: '09:00', end: '10:50' },
    { professor: '오현화', day: '목', start: '11:00', end: '12:50' },
    { professor: '문장원', day: '화', start: '09:00', end: '10:50' },
    { professor: '문장원', day: '화', start: '11:00', end: '12:50' },
    { professor: '곽승숙', day: '목', start: '09:00', end: '10:50' },
    { professor: '곽승숙', day: '목', start: '11:00', end: '12:50' },
    { professor: '박주혜', day: '목', start: '09:00', end: '10:50' },
  ],
  '인권과 평화': [
    { professor: '조경희', day: '금', start: '10:00', end: '11:50' },
    { professor: '강성현', day: '금', start: '10:00', end: '11:50' },
    { professor: '이상윤', day: '금', start: '10:00', end: '11:50' },
    { professor: '오영숙', day: '금', start: '10:00', end: '11:50' },
    { professor: '황준서', day: '금', start: '10:00', end: '11:50' },
  ],
  '과학기술과에콜로지': [
    { professor: '김명진', day: '화', start: '09:00', end: '10:50' },
    { professor: '김명진', day: '화', start: '11:00', end: '12:50' },
    { professor: '김명철, 신익상', day: '화', start: '09:00', end: '10:50' },
    { professor: '김명철, 신익상', day: '화', start: '11:00', end: '12:50' },
    { professor: '신익상, 김명철', day: '화', start: '09:00', end: '10:50' },
    { professor: '신익상, 김명철', day: '화', start: '11:00', end: '12:50' },
  ],
  '디지털리터러시': [
    { professor: '윤명호', day: '금', start: '10:00', end: '11:50' },
    { professor: '이해신', day: '금', start: '10:00', end: '11:50' },
    { professor: '김덕봉', day: '금', start: '10:00', end: '11:50' },
    { professor: '이하규', day: '금', start: '10:00', end: '11:50' },
    { professor: '홍성준', day: '금', start: '10:00', end: '11:50' },
    { professor: '곽승우', day: '금', start: '10:00', end: '11:50' },
    { professor: '공준욱', day: '금', start: '10:00', end: '11:50' },
  ],
};

function CourseRow({ course, index, isExcluded, onSelectProfessor, onSelectSlot, onToggleExclude }) {
  const sections = OFFERINGS[course.name] ?? [];
  const professors = [...new Set(sections.map((s) => s.professor))];
  const professorSections = sections.filter((s) => s.professor === course.professor);
  const hasMultipleSlots = professorSections.length > 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 flex items-center gap-4 transition">
      <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${NUM_COLOR[course.color]}`}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <p className="font-bold text-[15px] text-gray-800">{course.name}</p>

      <select
        value={course.professor}
        disabled={isExcluded}
        onChange={(e) => onSelectProfessor(course.id, e.target.value)}
        className="w-36 shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        <option value="">교수님 선택</option>
        {professors.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {hasMultipleSlots && (
        <select
          value={course.slot}
          disabled={isExcluded}
          onChange={(e) => onSelectSlot(course.id, Number(e.target.value))}
          className="shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          {professorSections.map((s, i) => <option key={i} value={i}>{`${s.day} ${s.start}~${s.end}`}</option>)}
        </select>
      )}

      <button
        onClick={() => onToggleExclude(course.id)}
        className={`ml-auto shrink-0 px-4 py-2 rounded-lg text-[13px] font-bold transition ${
          isExcluded
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}>
        이 과목은 안 듣습니다
      </button>
    </div>
  );
}

export default function CourseSelectPage() {
  const navigate = useNavigate();
  const setTranscriptFile = useTimetableStore((s) => s.setTranscriptFile);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [excluded, setExcluded] = useState([]);

  const toggleExclude = (id) =>
    setExcluded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // 신입생은 이수 과목이 없어 업로드할 성적표가 없다 — /timetables/generate가 file 파트를 필수로 요구하므로
  // 헤더 행만 있는 빈 성적표를 대신 채워 넣어 /input에서 바로 생성 요청을 보낼 수 있게 한다.
  const startAsFreshman = async () => {
    const res = await fetch('/freshman-transcript.xlsx');
    const blob = await res.blob();
    setTranscriptFile(new File([blob], 'freshman-transcript.xlsx', { type: blob.type }));
    navigate('/input');
  };

  // 교수님을 바꾸면 그 교수님의 분반 목록이 통째로 달라지므로 슬롯 선택은 0번으로 초기화한다
  const selectProfessor = (id, professor) =>
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, professor, slot: 0 } : c));

  const selectSlot = (id, slot) =>
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, slot } : c));

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
          {courses.map((course, i) => (
            <CourseRow
              key={course.id}
              course={course}
              index={i}
              isExcluded={excluded.includes(course.id)}
              onSelectProfessor={selectProfessor}
              onSelectSlot={selectSlot}
              onToggleExclude={toggleExclude}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4">
          <p className="text-sm text-gray-500">
            설정한 과목과 시간대를 기반으로 AI가 최적의 전체 시간표 조합을 생성해요.
          </p>
          <div className="ml-auto flex gap-3">
            <button onClick={startAsFreshman}
              className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              1학년 1학기입니다
            </button>
            <button onClick={() => navigate('/courses/second-semester')}
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