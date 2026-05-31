import { useEffect, useState } from 'react'
import { Package, ArrowUpCircle, AlertTriangle, Apple } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { StatCard, Card, Badge, Spinner } from '../components/UI'
import { lotesApi, distribuicoesApi, alimentosApi } from '../services/api'

export default function Dashboard() {
  const [lotes, setLotes] = useState([])
  const [vencendo, setVencendo] = useState([])
  const [resumo, setResumo] = useState([])
  const [alimentos, setAlimentos] = useState([])
  const [loading, setLoading] = useState(true)

  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1

  useEffect(() => {
    Promise.all([
      lotesApi.listar(),
      lotesApi.vencendo(30),
      distribuicoesApi.resumoMensal(ano, mes),
      alimentosApi.listar()
    ]).then(([l, v, r, a]) => {
      setLotes(l.data)
      setVencendo(v.data)
      setResumo(r.data)
      setAlimentos(a.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const totalKg = lotes.reduce((s, l) => s + parseFloat(l.quantidade || 0), 0).toFixed(1)
  const totalDistribuido = resumo.reduce((s, r) => s + parseFloat(r.total_distribuido || 0), 0).toFixed(1)

  const urgency = (dias) => {
    if (dias <= 7) return '#ef4444'
    if (dias <= 15) return '#f97316'
    return '#eab308'
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Visão geral — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Package} label="Total em estoque" value={`${totalKg} kg`} sub={`${lotes.length} lotes`} color="#4ade80" />
        <StatCard icon={ArrowUpCircle} label="Distribuído este mês" value={`${totalDistribuido} kg`} sub="saídas registradas" color="#60a5fa" />
        <StatCard icon={AlertTriangle} label="Vencendo em 30 dias" value={vencendo.length} sub="lotes em atenção" color="#f97316" />
        <StatCard icon={Apple} label="Tipos de alimentos" value={alimentos.length} sub="cadastrados" color="#a78bfa" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>
            Distribuição por alimento — {new Date().toLocaleString('pt-BR', { month: 'long' })}
          </h2>
          {resumo.length === 0 ? (
            <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Nenhuma distribuição registrada este mês.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={resumo} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="alimento" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(v) => [`${v} kg`, 'Distribuído']} />
                <Bar dataKey="total_distribuido" radius={[0, 6, 6, 0]}>
                  {resumo.map((_, i) => <Cell key={i} fill={['#4ade80', '#60a5fa', '#a78bfa', '#f97316', '#34d399'][i % 5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>Próximos vencimentos</h2>
          {vencendo.length === 0 ? (
            <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhum produto vencendo nos próximos 30 dias.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vencendo.slice(0, 8).map((v, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: '#0f172a', borderRadius: 8,
                  border: `1px solid ${urgency(v.dias_restantes)}22`
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{v.alimento}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{parseFloat(v.quantidade).toFixed(1)} kg · vence {new Date(v.data_validade).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <Badge color={urgency(v.dias_restantes)}>{v.dias_restantes}d</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
