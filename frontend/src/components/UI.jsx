export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 12, padding: 20, ...style
    }}>
      {children}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub, color = '#4ade80' }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '18', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </Card>
  )
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, type = 'button' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 8, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
    fontSize: size === 'sm' ? 12 : 13.5,
    padding: size === 'sm' ? '6px 12px' : '9px 16px',
  }
  const variants = {
    primary: { background: '#16a34a', color: '#fff' },
    secondary: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' },
    danger: { background: '#dc2626', color: '#fff' },
    ghost: { background: 'transparent', color: '#64748b' }
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

export function Badge({ children, color = '#4ade80' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: color + '20', color, border: `1px solid ${color}30`
    }}>
      {children}
    </span>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</label>}
      <input {...props} style={{
        background: '#0f172a', border: `1px solid ${error ? '#dc2626' : '#334155'}`,
        borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13.5,
        outline: 'none', width: '100%', transition: 'border 0.15s',
        ...props.style
      }} />
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</label>}
      <select {...props} style={{
        background: '#0f172a', border: '1px solid #334155',
        borderRadius: 8, padding: '8px 12px', color: '#f1f5f9',
        fontSize: 13.5, outline: 'none', width: '100%',
        ...props.style
      }}>
        {children}
      </select>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', fontSize: 18, lineHeight: 1
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({ columns, data, emptyMsg = 'Nenhum registro encontrado.' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 12px', textAlign: 'left', fontSize: 11,
                color: '#64748b', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.05em', whiteSpace: 'nowrap'
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: 'center', color: '#475569' }}>{emptyMsg}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 28, height: 28, border: '3px solid #334155',
        borderTop: '3px solid #4ade80', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
