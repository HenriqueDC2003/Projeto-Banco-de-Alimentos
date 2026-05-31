import { useEffect, useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { auxiliaresApi } from '../services/api'
import { Card, Button, Modal, Input, Select, Table, PageHeader, Badge, Spinner } from '../components/UI'

const empty = { nome: '', tipo: '', contato: '', descricao: '' }
const tipos = ['Supermercado', 'Empresa', 'Pessoa física', 'ONG', 'Governo', 'Outro']

export default function Parceiros() {
  const [parceiros, setParceiros] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => auxiliaresApi.parceiros().then(r => setParceiros(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try { await auxiliaresApi.criarParceiro(form); setModal(false); setForm(empty); load() }
    finally { setSaving(false) }
  }

  const tipoColor = (t) => ({ 'Supermercado': '#4ade80', 'Empresa': '#60a5fa', 'ONG': '#a78bfa', 'Governo': '#f97316', 'Pessoa física': '#34d399' }[t] || '#64748b')

  const columns = [
    { key: 'nome', label: 'Nome', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={15} color="#64748b" />
        </div>
        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.nome}</span>
      </div>
    )},
    { key: 'tipo', label: 'Tipo', render: r => r.tipo ? <Badge color={tipoColor(r.tipo)}>{r.tipo}</Badge> : '—' },
    { key: 'contato', label: 'Contato' },
    { key: 'descricao', label: 'Descrição', render: r => <span style={{ color: '#64748b' }}>{r.descricao || '—'}</span> }
  ]

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Parceiros &amp; Doadores" subtitle={`${parceiros.length} parceiros cadastrados`} action={<Button onClick={() => setModal(true)}><Plus size={15} /> Novo parceiro</Button>} />
      <Card><Table columns={columns} data={parceiros} emptyMsg="Nenhum parceiro cadastrado ainda." /></Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Novo parceiro">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nome *" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome do parceiro" />
          <Select label="Tipo" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
            <option value="">Selecione...</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Contato" value={form.contato} onChange={e => setForm(p => ({ ...p, contato: e.target.value }))} placeholder="Telefone ou e-mail" />
          <Input label="Descrição" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Opcional" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.nome || saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
