import { useAppStore } from '../store/useAppStore';
import BrandMark from './BrandMark';
import kakaoLogo from '../assets/kakao.png';
import googleLogo from '../assets/google.png';

export default function Login() {
  const { loginId, loginPw, setLoginId, setLoginPw, goTo } = useAppStore();

  const inputClass =
    'w-full px-3.5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg ' +
    'text-gray-900 outline-none transition placeholder:text-gray-400 ' +
    'focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20';

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(15,23,43,0.08)] px-9 py-10">
        <div className="w-14 h-14 mx-auto mb-5 bg-primary-500 rounded-2xl flex items-center justify-center p-3 shadow-[0_6px_16px_rgba(124,207,0,0.3)]">
          <BrandMark />
        </div>

        <h1 className="text-center text-[26px] font-extrabold tracking-tight mb-1.5">시간표짜조</h1>
        <p className="text-center text-sm text-gray-400 mb-8">로그인하고 이번 학기 시간표를 짜보세요</p>

        <div className="mb-[18px]">
          <label className="block text-[13px] font-bold text-gray-600 mb-2">아이디</label>
          <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)}
            className={inputClass} placeholder="아이디를 입력하세요" />
        </div>

        <div className="mb-[18px]">
          <label className="block text-[13px] font-bold text-gray-600 mb-2">비밀번호</label>
          <input type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)}
            className={inputClass} placeholder="비밀번호를 입력하세요" />
        </div>

        <button onClick={() => goTo('analyze')}
          className="w-full py-3.5 text-[15px] font-bold text-white bg-primary-500 rounded-lg mt-1.5 transition hover:bg-primary-600 active:scale-[0.99]">
          로그인
        </button>

        <p className="text-center text-xs text-gray-400 my-[26px]">간편 로그인</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => goTo('analyze')}
            className="w-11 h-11 rounded-full bg-kakao flex items-center justify-center transition hover:brightness-95">
            <img src={kakaoLogo} alt="카카오 로그인" className="w-6 h-6 object-contain" />
          </button>
          <button onClick={() => goTo('analyze')}
            className="w-11 h-11 rounded-full bg-[#f8f9fa] border border-gray-200 flex items-center justify-center transition hover:brightness-95">
            <img src={googleLogo} alt="구글 로그인" className="w-6 h-6 object-contain" />
          </button>
          <button onClick={() => goTo('analyze')}
            className="w-11 h-11 rounded-full bg-naver text-white flex items-center justify-center font-bold transition hover:brightness-95">N</button>
        </div>

        <div className="flex gap-4 justify-center mt-6 text-[13px]">
          <a className="text-gray-400 hover:text-primary-600 cursor-pointer">회원가입</a>
          <span className="text-gray-200">|</span>
          <a className="text-gray-400 hover:text-primary-600 cursor-pointer">아이디 · 비밀번호 찾기</a>
        </div>
      </div>
    </div>
  );
}