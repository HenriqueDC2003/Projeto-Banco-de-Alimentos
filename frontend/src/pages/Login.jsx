import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { Button, Input } from '../components/UI'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      await authService.login(email, senha)
      navigate('/', { replace: true })
      window.location.reload()
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '40px 32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#fff'
          }}>
            B
          </div>
        </div>

        {/* Título */}
        <h1 style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: '700',
          color: '#f1f5f9',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Banco de Alimentos
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#94a3b8',
          marginBottom: '32px',
          margin: '0 0 32px 0'
        }}>
          Sistema de Gestão de Estoque
        </p>

        {/* Mensagem de erro */}
        {erro && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#fca5a5'
          }}>
            {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '6px'
            }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1a2332',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#f1f5f9',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4ade80' }}
              onBlur={(e) => { e.target.style.borderColor = '#334155' }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '6px'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1a2332',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#f1f5f9',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#4ade80' }}
              onBlur={(e) => { e.target.style.borderColor = '#334155' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '10px 16px',
              background: loading ? '#64748b' : '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#15803d'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = '#16a34a'
            }}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        {/* Rodapé */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          marginTop: '20px',
          margin: '20px 0 0 0'
        }}>
          UniLaSalle · 2026
        </p>
      </div>
    </div>
  )
}
