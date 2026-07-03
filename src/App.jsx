import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Analyze from './pages/AnalyzePage'
import CourseSelectPage from './pages/CourseSelectPage'
import TimetableInputPage from './pages/TimetableInputPage'
import TimetableResultPage from './pages/TimetableResultPage'
import TimetableNoResultPage from './pages/TimetableNoResultPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/upload" element={<Analyze />} />
        <Route path="/courses" element={<CourseSelectPage />} />
        {/* 1학년 2학기는 1학기 성적이 이미 있으므로 AnalyzePage의 엑셀 업로드 흐름을 재사용해 성적표를 받는다 */}
        <Route path="/courses/second-semester" element={<Analyze showFreshmanPrompt={false} />} />
        <Route path="/input" element={<TimetableInputPage />} />
        <Route path="/result" element={<TimetableResultPage />} />
        <Route path="/result/empty" element={<TimetableNoResultPage />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
