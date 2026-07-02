import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useTimetableStore } from '../store/timetableStore';
import TopBar from '../components/TopBar';

const STEPS = [
  '엑셀 파일 읽기',
  '전공 · 교양 이수 학점 분류',
  '졸업 요건 대비 잔여 학점 계산',
  '들을 수 있는 과목 추리기',
];

export default function Analyze() {
  const navigate = useNavigate();
  const {
    analyzing, progress, doneSteps, activeStep, analyzed,
    startAnalysis, setProgress, setDoneSteps, setActiveStep, finishAnalysis,
  } = useAppStore();
  const setTranscriptFile = useTimetableStore((s) => s.setTranscriptFile);
  const running = useRef(false);
  const [fileName, setFileName] = useState('');

  const run = (file) => {
    if (running.current) return;
    running.current = true;
    startAnalysis();

    let step = 0;
    const targets = [25, 50, 75, 100];

    const next = () => {
      if (step >= STEPS.length) {
        // 엑셀 파싱은 백엔드가 /timetables/generate에서 조건과 함께 한 번에 처리하므로
        // 여기서는 파일을 store에 담아두기만 하고, 이 연출용 진행 애니메이션으로 끝낸다
        setTranscriptFile(file);
        finishAnalysis();
        return;
      }
      setActiveStep(step);
      const start = step === 0 ? 0 : targets[step - 1];
      const end = targets[step];
      let p = start;
      const iv = setInterval(() => {
        p += 2;
        if (p >= end) { p = end; clearInterval(iv); }
        setProgress(p);
      }, 30);

      setTimeout(() => {
        setDoneSteps(step + 1);
        step += 1;
        next();
      }, 1100);
    };
    next();
  };

  const pickFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    run(file);
  };

  return (
    <>
      <TopBar />
      <main className="max-w-[640px] mx-auto px-6 pt-14 pb-20">
        <div className="text-center mb-9">
          <h2 className="text-2xl font-bold tracking-tight mb-2.5">지난 수강 내역을 올려주세요</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            성적표를 분석해서 남은 졸업 요건과 이번 학기에 들을 수 있는 과목을 추려드려요.
          </p>
        </div>

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
          className="w-full bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,43,0.06)] border-2 border-dashed border-gray-200 px-8 py-12 text-center mb-6 transition hover:border-primary-500 hover:bg-primary-100/30 cursor-pointer block">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => pickFile(e.target.files?.[0])}
            className="hidden"
          />
          <div className="w-16 h-16 mx-auto mb-5 bg-primary-100 rounded-2xl flex items-center justify-center">
            <svg className="w-[34px] h-[34px]" viewBox="0 0 24 24" fill="none" stroke="#5ea500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" /><path d="m9 13 6 6M15 13l-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">과거 수강 내역 (Excel)</h3>
          <p className="text-[13px] text-gray-400 leading-relaxed mb-[22px]">
            {fileName || (
              <>학사정보시스템 → 졸업 → 졸업 자가진단 → 전체 성적에서<br />엑셀 파일을 내려받아 여기로 끌어다 놓으세요</>
            )}
          </p>
          <span className="inline-block px-6 py-[11px] text-sm font-bold text-primary-600 bg-primary-100 rounded-lg">
            파일 선택
          </span>
        </label>

        {analyzing && (
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,43,0.06)] border border-gray-200 px-[26px] py-6 mb-7">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-sm font-bold">분석 진행률</span>
              <span className="text-sm font-extrabold text-primary-600">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-[18px]">
              <div className="h-full bg-primary-500 rounded-full transition-[width] duration-300"
                style={{ width: `${progress}%` }} />
            </div>
            <ul className="flex flex-col gap-[9px]">
              {STEPS.map((label, i) => {
                const isDone = i < doneSteps;
                const isActive = i === activeStep;
                return (
                  <li key={i} className={`flex items-center gap-2.5 text-[13px] ${isDone || isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    <span className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                      isDone ? 'bg-primary-500'
                      : isActive ? 'border-2 border-primary-500 border-t-transparent animate-spin'
                      : 'bg-gray-200'
                    }`}>
                      {isDone && (
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <button
          disabled={!analyzed}
          onClick={() => navigate('/input')}
          className={`block mx-auto px-8 py-[13px] text-sm font-bold rounded-lg transition ${
            analyzed
              ? 'text-white bg-primary-500 hover:bg-primary-600 cursor-pointer'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}>
          {analyzed ? '다음 단계로' : '분석이 끝나면 넘어갈 수 있어요'}
        </button>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        © 2026 시간표짜조
      </footer>
    </>
  );
}
