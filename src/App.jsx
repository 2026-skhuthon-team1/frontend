import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TimetableInputPage from './pages/TimetableInputPage'
import TimetableResultPage from './pages/TimetableResultPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/input" element={<TimetableInputPage />} />
        <Route path="/result" element={<TimetableResultPage />} />
        <Route path="*" element={<Navigate to="/input" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
