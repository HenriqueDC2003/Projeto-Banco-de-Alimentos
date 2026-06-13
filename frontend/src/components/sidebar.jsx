import { useNavigate } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Apple, Package, ArrowDownCircle,
  ArrowUpCircle, Building2, Users, LogOut
} from 'lucide-react'
import { authService } from '../services/auth'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alimentos', icon: Apple, label: 'Alimentos' },
  { to: '/lotes', icon: Package, label: 'Entradas (Lotes)' },
  { to: '/distribuicoes', icon: ArrowUpCircle, label: 'Saídas' },
  { to: '/parceiros', icon: Building2, label: 'Parceiros' },
  { to: '/vencendo', icon: ArrowDownCircle, label: 'A Vencer' },
]

export default function Sidebar() {
  const usuario = authService.getUsuario()
  const isAdmin = authService.isAdmin()
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
    window.location.reload()
  }

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#0f172a',
      borderRight: '1px solid #1e293b', display: 'flex',
      flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50
    }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0
          }}>B</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              Banco de Alimentos
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Canoas · Sistema</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                color: isActive ? '#4ade80' : '#94a3b8',
                background: isActive ? 'rgba(74,222,128,0.08)' : 'transparent',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                cursor: 'pointer',
                border: isActive ? '1px solid rgba(74,222,128,0.15)' : '1px solid transparent'
              }}>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink to="/usuarios">
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                color: isActive ? '#4ade80' : '#94a3b8',
                background: isActive ? 'rgba(74,222,128,0.08)' : 'transparent',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                cursor: 'pointer',
                border: isActive ? '1px solid rgba(74,222,128,0.15)' : '1px solid transparent'
              }}>
                <Users size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>Usuários</span>
              </div>
            )}
          </NavLink>
        )}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: '4px' }}>Logado como</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
            {usuario?.nome} {usuario?.sobrenome}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: '2px' }}>
            {usuario?.nivel === 'admin' ? 'Administrador' : 'Operador'}
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)'
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)'
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)'
          }}
        >
          <LogOut size={14} />
          Sair
        </button>

        <div style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: '8px' }}>
          UniLaSalle · 2026
        </div>
      </div>
    </aside>
  )
}