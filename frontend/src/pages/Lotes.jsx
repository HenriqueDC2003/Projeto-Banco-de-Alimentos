import { useEffect, useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import { lotesApi, alimentosApi, auxiliaresApi } from '../services/api'
import { Card, Button, Modal, Input, Select, Table, PageHeader, Badge, Spinner } from '../components/UI'

const empty = { id_alimento: '', id_parceiro: '', quantidade: '', data_chegada: new Date().toISOString().split('T')[0], data_validade: '', foi_comprado: false, preco: '' }

export default function Lotes() {
  const [lotes, setLotes] = useState([])
  const [alimentos, setAlimentos] = useState([])
  const [parceiros, setParceiros] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => Promise.all([
    lotesApi.listar(), alimentosApi.listar(), auxiliaresApi.parceiros()
  ]).then(([l, a, p]) => {
    setLotes(l.data); setAlimentos(a.data); setParceiros(p.data)
  }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      await lotesApi.criar({ ...form, quantidade: parseFloat(form.quantidade), preco: form.preco ? parseFloat(form.preco) : null, id_parceiro: form.id_parceiro || null, data_validade: form.data_validade || null })
      setModal(false); setForm(empty); load()
    } finally { setSaving(false) }
  }

  const marcarEstragado = async (id) => {
    if (!confirm('Marcar lote como estragado?')) return
    await lotesApi.marcarEstragado(id); load()
  }

  const nome = (arr, id) => arr.find(x => x.id === id)?.nome || '—'

  const statusValidade = (val, estragado) => {
    if (estragado) return <Badge color="#ef4444">estragado</Badge>
    if (!val) return <span style={{ color: '#475569' }}>sem validade</span>
    const d = Math.ceil((new Date(val) - new Date()) / 86400000)
    if (d < 0) return <Badge color="#ef4444">vencido</Badge>
    if (d <= 7) return <Badge color="#ef4444">{d}d</Badge>
    if (d <= 30) return <Badge color="#f97316">{d}d</Badge>
    return <Badge color="#4ade80">{d}d</Badge>
  }

  const columns = [
    { key: 'alimento', label: 'Alimento', render: r => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{nome(alimentos, r.id_alimento)}</span> },
    { key: 'quantidade', label: 'Qtd', render: r => `${parseFloat(r.quantidade).toFixed(1)} kg` },
    { key: 'data_chegada', label: 'Chegada', render: r => new Date(r.data_chegada).toLocaleDateString('pt-BR') },
    { key: 'validade', label: 'Validade', render: r => r.data_validade ? new Date(r.data_validade).toLocaleDateString('pt-BR') : '—' },
    { key: 'status', label: 'Status', render: r => statusValidade(r.data_validade, r.esta_estragado) },
    { key: 'parceiro', label: 'Parceiro', render: r => nome(parceiros, r.id_parceiro) },
    { key: 'acoes', label: '', render: r => !r.esta_estragado && <Button variant="danger" size="sm" onClick={() => marcarEstragado(r.id)}><AlertCircle size={13} /> Estragado</Button> }
  ]

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Entradas — Lotes" subtitle={`${lotes.length} lotes registrados`} action={<Button onClick={() => setModal(true)}><Plus size={15} /> Registrar entrada</Button>} />
      <Card><Table columns={columns} data={lotes} emptyMsg="Nenhuma entrada registrada ainda." /></Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar entrada de lote">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Alimento *" value={form.id_alimento} onChange={e => setForm(p => ({ ...p, id_alimento: e.target.value }))}>
            <option value="">Selecione...</option>
            {alimentos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </Select>
          <Select label="Parceiro / Doador" value={form.id_parceiro} onChange={e => setForm(p => ({ ...p, id_parceiro: e.target.value }))}>
            <option value="">Selecione...</option>
            {parceiros.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Quantidade (kg) *" type="number" step="0.001" value={form.quantidade} onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))} placeholder="0.000" />
            <Input label="Preço (R$)" type="number" step="0.01" value={form.preco} onChange={e => setForm(p => ({ ...p, preco: e.target.value }))} placeholder="0.00" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Data de chegada *" type="date" value={form.data_chegada} onChange={e => setForm(p => ({ ...p, data_chegada: e.target.value }))} />
            <Input label="Data de validade" type="date" value={form.data_validade} onChange={e => setForm(p => ({ ...p, data_validade: e.target.value }))} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.foi_comprado} onChange={e => setForm(p => ({ ...p, foi_comprado: e.target.checked }))} />
            Foi comprado (não doado)
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.id_alimento || !form.quantidade || saving}>{saving ? 'Salvando...' : 'Registrar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
