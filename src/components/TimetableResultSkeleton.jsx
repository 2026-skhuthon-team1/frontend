import TopBar from './TopBar';

const DAYS = ['월', '화', '수', '목', '금'];
const SLOT_COUNT = 7; // 결과 화면 기본 범위(09:00 ~ 19:30)와 같은 칸 수
const CARD_COUNT = 3; // 결과 화면은 추천 조합을 최대 3개 보여준다

// 요일별 자리표시 블록 — [요일, 시작 칸, 칸 수]. 실제 시간표처럼 보이게 띄엄띄엄 놓는다
const BLOCKS = [
  [0, 1, 1], [0, 3, 1], [1, 0, 1], [1, 4, 1],
  [2, 2, 1], [3, 1, 1], [3, 3, 1], [4, 0, 1],
];

// 시간표 생성(AI 랭킹 포함 30~40초)을 기다리는 동안 결과 화면과 같은 틀을 미리 보여준다
export default function TimetableResultSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white lg:h-screen lg:overflow-hidden" aria-busy="true">
      <TopBar />

      {/* 기다리는 이유와 대략의 시간을 알려준다 */}
      <div role="status" className="flex items-center justify-center gap-2.5 bg-primary-50 border-b border-primary-100 px-6 py-3">
        <span className="w-4 h-4 shrink-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-800">AI가 시간표를 짜고 있어요.</span> 30~40초 정도 걸려요.
        </p>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden animate-pulse">
        {/* 왼쪽 패널 — 추천 조합 카드 자리 */}
        <aside className="w-full shrink-0 bg-[#f8fafc] border-b border-[#f1f5f9] flex flex-col lg:w-[320px] xl:w-[380px] lg:border-b-0 lg:border-r">
          <div className="px-6 py-4">
            <div className="h-5 w-28 rounded bg-[#e2e8f0]" />
          </div>
          <div className="flex gap-3 px-6 pb-6 overflow-hidden lg:flex-col">
            {Array.from({ length: CARD_COUNT }, (_, i) => (
              <div key={i} className="w-[260px] shrink-0 bg-white rounded-2xl border-2 border-[#e2e8f0] p-5 lg:w-full">
                <div className="h-5 w-16 rounded bg-[#f1f5f9] mb-3" />
                <div className="h-4 w-32 rounded bg-[#e2e8f0] mb-2" />
                <div className="h-3 w-full rounded bg-[#f1f5f9] mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 w-14 rounded bg-[#f1f5f9]" />
                  <div className="h-5 w-20 rounded bg-[#f1f5f9]" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 오른쪽 패널 — 시간표 미리보기 자리 */}
        <main className="flex-1 min-w-0 flex flex-col px-4 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="h-7 w-56 rounded bg-[#e2e8f0]" />
            <div className="h-10 w-28 rounded-xl bg-[#f1f5f9]" />
          </div>

          <div className="mb-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
            <div className="h-3 w-20 rounded bg-[#e2e8f0] mb-3" />
            <div className="h-4 w-3/4 rounded bg-[#e2e8f0]" />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e2e8f0]">
            <div className="min-w-[640px]">
              <div
                className="grid bg-[#f8fafc] border-b border-[#e2e8f0]"
                style={{ gridTemplateColumns: '56px repeat(5, minmax(0, 1fr))' }}
              >
                <div className="h-10 border-r border-[#e2e8f0]" />
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`h-10 flex items-center justify-center font-bold text-sm text-[#cad5e2] ${i < 4 ? 'border-r border-[#e2e8f0]' : ''}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid" style={{ gridTemplateColumns: '56px repeat(5, minmax(0, 1fr))' }}>
                <div className="border-r border-[#e2e8f0]">
                  {Array.from({ length: SLOT_COUNT }, (_, i) => (
                    <div key={i} className={`h-[60px] ${i < SLOT_COUNT - 1 ? 'border-b border-[#e2e8f0]' : ''}`} />
                  ))}
                </div>
                {DAYS.map((day, dayIdx) => (
                  <div
                    key={day}
                    className={`relative ${dayIdx < 4 ? 'border-r border-[#e2e8f0]' : ''}`}
                    style={{ height: SLOT_COUNT * 60 }}
                  >
                    {BLOCKS.filter(([d]) => d === dayIdx).map(([, start, span]) => (
                      <div
                        key={start}
                        className="absolute rounded bg-[#f1f5f9]"
                        style={{ top: start * 60 + 2, height: span * 60 - 4, left: 2, right: 2 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
