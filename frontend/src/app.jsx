import { useEffect, useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/auth'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Alimentos from './pages/Alimentos'
import Lotes from './pages/Lotes'
import Distribuicoes from './pages/Distribuicoes'
import Parceiros from './pages/Parceiros'
import Vencendo from './pages/Vencendo'
import Usuarios from './pages/Usuarios'

function ProtectedLayout() {
  return (
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
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const [logado, setLogado] = useState(null)

  useEffect(() => {
    setLogado(authService.isLogado())
  }, [])

  if (logado === null) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!logado ? <Login /> : <Navigate to="/" replace />} />
        <Route path="*" element={logado ? <ProtectedLayout /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
