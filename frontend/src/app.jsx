import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Alimentos from './pages/Alimentos'
import Lotes from './pages/Lotes'
import Distribuicoes from './pages/Distribuicoes'
import Parceiros from './pages/Parceiros'
import Vencendo from './pages/Vencendo'

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
        <Sidebar />
        <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', maxWidth: 'calc(100vw - 240px)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alimentos" element={<Alimentos />} />
            <Route path="/lotes" element={<Lotes />} />
            <Route path="/distribuicoes" element={<Distribuicoes />} />
            <Route path="/parceiros" element={<Parceiros />} />
            <Route path="/vencendo" element={<Vencendo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
