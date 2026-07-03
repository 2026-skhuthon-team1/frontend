import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const INITIAL_COURSES = [
  { id: 1, name: '말과글', category: '공통교양 · 2학점', day: '월', start: '09:00', end: '11:00', color: 'blue' },
  { id: 2, name: '대학생활세미나', category: '공통교양 · 2학점', day: '월', start: '09:00', end: '11:00', color: 'purple' },
  { id: 3, name: '인권과 평화', category: '중핵교양 · 2학점', day: '월', start: '09:00', end: '11:00', color: 'orange' },
  { id: 4, name: '데이터활용분석', category: '기초교양 · 2학점', day: '월', start: '09:00', end: '11:00', color: 'teal' },
  { id: 5, name: '디지털리터러시', category: '기초교양 · 2학점', day: '월', start: '09:00', end: '11:00', color: 'pink' },
]

const NUM_COLOR = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-pink-50 text-pink-600',
};

const DAYS = ['월', '화', '수', '목', '금'];

const TIME_OPTIONS = [];
for (let h = 9; h <= 18; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 18) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
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
          {courses.map((course, i) => {
            const isExcluded = excluded.includes(course.id);
            return (
              <div key={course.id}
                className="rounded-2xl border border-gray-200 bg-white px-6 py-5 flex items-center gap-4 transition">
                <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${NUM_COLOR[course.color]}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="w-36 shrink-0">
                  <p className="font-bold text-[15px] text-gray-800">{course.name}</p>
                  <p className="text-[12px] text-gray-400">{course.category}</p>
                </div>

                <select
                  value={course.day}
                  disabled={isExcluded}
                  onChange={(e) => updateCourse(course.id, 'day', e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {DAYS.map((d) => <option key={d} value={d}>{d}요일</option>)}
                </select>

                <select
                  value={course.start}
                  disabled={isExcluded}
                  onChange={(e) => updateCourse(course.id, 'start', e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                <span className="text-gray-300">~</span>

                <select
                  value={course.end}
                  disabled={isExcluded}
                  onChange={(e) => updateCourse(course.id, 'end', e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                <button
                  onClick={() => toggleExclude(course.id)}
                  className={`ml-auto shrink-0 px-4 py-2 rounded-lg text-[13px] font-bold transition ${
                    isExcluded
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  이 과목은 안 듣습니다
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4">
          <p className="text-sm text-gray-500">
            설정한 과목과 시간대를 기반으로 AI가 최적의 전체 시간표 조합을 생성해요.
          </p>
          <div className="ml-auto flex gap-3">
            <button onClick={() => navigate('/analyze')}
              className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              이전으로
            </button>
            <button onClick={() => navigate('/result')}
              className="px-6 py-3 text-sm font-bold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition">
              최적 시간표 생성하기
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