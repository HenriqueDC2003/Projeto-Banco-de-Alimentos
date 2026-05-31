import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { lotesApi, alimentosApi } from '../services/api'
import { Card, Table, PageHeader, Badge, Spinner, Button } from '../components/UI'

export default function Vencendo() {
  const [vencendo, setVencendo] = useState([])
  const [alimentos, setAlimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState(30)

  const load = (d = dias) => {
    setLoading(true)
    Promise.all([lotesApi.vencendo(d), alimentosApi.listar()])
      .then(([v, a]) => { setVencendo(v.data); setAlimentos(a.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const urgency = (d) => {
    if (d <= 0) return '#ef4444'
    if (d <= 7) return '#ef4444'
    if (d <= 15) return '#f97316'
    return '#eab308'
  }

  const columns = [
    { key: 'alimento', label: 'Alimento', render: r => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.alimento}</span> },
    { key: 'quantidade', label: 'Qtd restante', render: r => `${parseFloat(r.quantidade).toFixed(1)} kg` },
    { key: 'data_validade', label: 'Vence em', render: r => new Date(r.data_validade).toLocaleDateString('pt-BR') },
    { key: 'dias', label: 'Dias restantes', render: r => <Badge color={urgency(r.dias_restantes)}>{r.dias_restantes <= 0 ? 'VENCIDO' : `${r.dias_restantes} dias`}</Badge> }
  ]

  return (
    <div>
      <PageHeader
        title="Produtos a Vencer"
        subtitle="Lotes próximos do vencimento ordenados por urgência"
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Mostrar próximos:</span>
            {[15, 30, 60].map(d => (
              <Button key={d} variant={dias === d ? 'primary' : 'secondary'} size="sm" onClick={() => { setDias(d); load(d) }}>{d}d</Button>
            ))}
          </div>
        }
      />
      {vencendo.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9731620', border: '1px solid #f9731640', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
          <AlertTriangle size={16} color="#f97316" />
          <span style={{ fontSize: 13, color: '#f97316' }}>{vencendo.filter(v => v.dias_restantes <= 7).length} lotes vencem em menos de 7 dias.</span>
        </div>
      )}
      <Card>
        {loading ? <Spinner /> : <Table columns={columns} data={vencendo} emptyMsg={`Nenhum produto vencendo nos próximos ${dias} dias.`} />}
      </Card>
    </div>
  )
}
