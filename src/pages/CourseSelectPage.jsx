import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const INITIAL_COURSES = [
  { id: 1, name: '대학생활세미나', color: 'blue', professor: '' },
  { id: 2, name: '말과글', color: 'purple', professor: '', slot: 0 },
  { id: 3, name: '인권과 평화', color: 'orange', professor: '' },
  { id: 4, name: '과학기술과에콜로지', color: 'teal', professor: '', slot: 0 },
  { id: 5, name: '디지털리터러시', color: 'pink', professor: '' },
]

const NUM_COLOR = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-pink-50 text-pink-600',
};

// 백엔드 /courses/offerings가 500을 던져서(교수님 정보를 못 받아옴) 실제 개설 교수님 명단을 정적으로 박아둔다.
// 백엔드가 고쳐지면 이 목록은 지우고 useProfessorOptions(백엔드 조회)로 되돌리면 된다.
const PROFESSORS = {
  '대학생활세미나': ['김혜인', '김아름', '윤영도', '송재민', '김용미', '황준서', '유철규', '김태경', '최정태', '윤장열', '이원정', '오세현', '김수림', '곽승우', '김선형', '김명철', '박정식'],
  '말과글': ['오현화', '문장원', '곽승숙', '박주혜'],
  '인권과 평화': ['조경희', '강성현', '이상윤', '오영숙', '황준서'],
  '과학기술과에콜로지': ['김명진', '김명철', '신익상'],
  '디지털리터러시': ['윤명호', '이해신', '김덕봉', '이하규', '홍성준', '곽승우', '공준욱'],
};

// 말과글·과학기술과에콜로지는 화·목 고정 2타임제 분반이라 자유 요일/시간 선택 대신 정해진 슬롯 중에서 고른다
const SECTION_SLOTS = [
  { days: ['화', '목'], start: '09:00', end: '10:50', label: '화·목 09:00~10:50' },
  { days: ['화', '목'], start: '11:00', end: '12:50', label: '화·목 11:00~12:50' },
];

function CourseRow({ course, index, isExcluded, onUpdate, onToggleExclude }) {
  const professorOptions = PROFESSORS[course.name] ?? [];
  const hasSlot = course.slot !== undefined;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 flex items-center gap-4 transition">
      <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${NUM_COLOR[course.color]}`}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <p className="font-bold text-[15px] text-gray-800">{course.name}</p>

      <select
        value={course.professor}
        disabled={isExcluded}
        onChange={(e) => onUpdate(course.id, 'professor', e.target.value)}
        className="w-28 shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        <option value="">교수님 선택</option>
        {professorOptions.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {hasSlot && (
        <select
          value={course.slot}
          disabled={isExcluded}
          onChange={(e) => onUpdate(course.id, 'slot', Number(e.target.value))}
          className="shrink-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          {SECTION_SLOTS.map((slot, i) => <option key={i} value={i}>{slot.label}</option>)}
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
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [excluded, setExcluded] = useState([]);

  const toggleExclude = (id) =>
    setExcluded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const updateCourse = (id, field, value) =>
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));

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
              onUpdate={updateCourse}
              onToggleExclude={toggleExclude}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4">
          <p className="text-sm text-gray-500">
            설정한 과목과 시간대를 기반으로 AI가 최적의 전체 시간표 조합을 생성해요.
          </p>
          <div className="ml-auto flex gap-3">
            <button onClick={() => navigate('/input')}
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