import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/LoginPage'
import Analyze from './pages/AnalyzePage'
import TimetableInputPage from './pages/TimetableInputPage'
import TimetableResultPage from './pages/TimetableResultPage'
import TimetableNoResultPage from './pages/TimetableNoResultPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Analyze />} />
        <Route path="/input" element={<TimetableInputPage />} />
        <Route path="/result" element={<TimetableResultPage />} />
        <Route path="/result/empty" element={<TimetableNoResultPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
