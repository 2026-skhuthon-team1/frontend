import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TimetableInputPage from './pages/TimetableInputPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/input" element={<TimetableInputPage />} />
        <Route path="*" element={<Navigate to="/input" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
