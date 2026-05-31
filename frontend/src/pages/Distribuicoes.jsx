import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { distribuicoesApi, lotesApi, alimentosApi } from '../services/api'
import { Card, Button, Modal, Input, Select, Table, PageHeader, Spinner } from '../components/UI'

const empty = { id_lote: '', quantidade: '', data: new Date().toISOString().split('T')[0] }

export default function Distribuicoes() {
  const [dist, setDist] = useState([])
  const [lotes, setLotes] = useState([])
  const [alimentos, setAlimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const load = () => Promise.all([
    distribuicoesApi.listar(), lotesApi.listar(), alimentosApi.listar()
  ]).then(([d, l, a]) => {
    setDist(d.data)
    setLotes(l.data.filter(x => !x.esta_estragado && parseFloat(x.quantidade) > 0))
    setAlimentos(a.data)
  }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true); setErro('')
    try {
      await distribuicoesApi.criar({ ...form, quantidade: parseFloat(form.quantidade), id_entidade: '00000000-0000-0000-0000-000000000001', id_usuario: '00000000-0000-0000-0000-000000000001' })
      setModal(false); setForm(empty); load()
    } catch (e) {
      setErro(e.response?.data?.detail || 'Erro ao registrar saída.')
    } finally { setSaving(false) }
  }

  const nomeAlimento = (id_lote) => {
    const lote = lotes.find(l => l.id === id_lote)
    if (!lote) return '—'
    return alimentos.find(a => a.id === lote.id_alimento)?.nome || '—'
  }

  const loteLabel = (l) => {
    const al = alimentos.find(a => a.id === l.id_alimento)?.nome || 'Alimento'
    return `${al} — ${parseFloat(l.quantidade).toFixed(1)} kg — vence ${l.data_validade ? new Date(l.data_validade).toLocaleDateString('pt-BR') : 'sem validade'}`
  }

  const columns = [
    { key: 'alimento', label: 'Alimento', render: r => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{nomeAlimento(r.id_lote)}</span> },
    { key: 'quantidade', label: 'Qtd', render: r => `${parseFloat(r.quantidade).toFixed(1)} kg` },
    { key: 'data', label: 'Data', render: r => new Date(r.data).toLocaleDateString('pt-BR') },
  ]

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Saídas — Distribuições" subtitle={`${dist.length} distribuições registradas`} action={<Button onClick={() => setModal(true)}><Plus size={15} /> Registrar saída</Button>} />
      <Card><Table columns={columns} data={dist} emptyMsg="Nenhuma distribuição registrada ainda." /></Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar saída">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Lote *" value={form.id_lote} onChange={e => setForm(p => ({ ...p, id_lote: e.target.value }))}>
            <option value="">Selecione o lote...</option>
            {lotes.map(l => <option key={l.id} value={l.id}>{loteLabel(l)}</option>)}
          </Select>
          <Input label="Quantidade (kg) *" type="number" step="0.001" value={form.quantidade} onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))} placeholder="0.000" />
          <Input label="Data *" type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
          {erro && <div style={{ color: '#f87171', fontSize: 12, background: '#dc262622', padding: '8px 12px', borderRadius: 6 }}>{erro}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.id_lote || !form.quantidade || saving}>{saving ? 'Salvando...' : 'Registrar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
