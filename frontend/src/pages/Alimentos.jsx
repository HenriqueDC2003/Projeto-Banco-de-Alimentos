import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { alimentosApi, auxiliaresApi } from '../services/api'
import { Card, Button, Modal, Input, Select, Table, PageHeader, Badge, Spinner } from '../components/UI'

const empty = { nome: '', id_tipo: '', id_marca: '', id_unidade: '', descricao: '' }

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState([])
  const [tipos, setTipos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => Promise.all([
    alimentosApi.listar(), auxiliaresApi.tipos(), auxiliaresApi.marcas(), auxiliaresApi.unidades()
  ]).then(([a, t, m, u]) => {
    setAlimentos(a.data); setTipos(t.data); setMarcas(m.data); setUnidades(u.data)
  }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(empty); setEditing(null); setModal(true) }
  const openEdit = (a) => {
    setForm({ nome: a.nome, id_tipo: a.id_tipo || '', id_marca: a.id_marca || '', id_unidade: a.id_unidade || '', descricao: a.descricao || '' })
    setEditing(a.id); setModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, id_tipo: form.id_tipo || null, id_marca: form.id_marca || null, id_unidade: form.id_unidade || null }
      if (editing) await alimentosApi.atualizar(editing, payload)
      else await alimentosApi.criar(payload)
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('Deletar este alimento?')) return
    await alimentosApi.deletar(id); load()
  }

  const nome = (arr, id) => arr.find(x => x.id === id)?.nome || '—'

  const columns = [
    { key: 'nome', label: 'Nome', render: r => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.nome}</span> },
    { key: 'tipo', label: 'Tipo', render: r => <Badge color="#4ade80">{nome(tipos, r.id_tipo)}</Badge> },
    { key: 'marca', label: 'Marca', render: r => nome(marcas, r.id_marca) },
    { key: 'unidade', label: 'Unidade', render: r => nome(unidades, r.id_unidade) },
    { key: 'acoes', label: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="secondary" size="sm" onClick={() => openEdit(r)}><Pencil size={13} /></Button>
        <Button variant="danger" size="sm" onClick={() => del(r.id)}><Trash2 size={13} /></Button>
      </div>
    )}
  ]

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader title="Alimentos" subtitle={`${alimentos.length} produtos cadastrados`} action={<Button onClick={openNew}><Plus size={15} /> Novo alimento</Button>} />
      <Card><Table columns={columns} data={alimentos} emptyMsg="Nenhum alimento cadastrado ainda." /></Card>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar alimento' : 'Novo alimento'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nome *" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Arroz branco" />
          <Select label="Tipo" value={form.id_tipo} onChange={e => setForm(p => ({ ...p, id_tipo: e.target.value }))}>
            <option value="">Selecione...</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </Select>
          <Select label="Marca" value={form.id_marca} onChange={e => setForm(p => ({ ...p, id_marca: e.target.value }))}>
            <option value="">Selecione...</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </Select>
          <Select label="Unidade" value={form.id_unidade} onChange={e => setForm(p => ({ ...p, id_unidade: e.target.value }))}>
            <option value="">Selecione...</option>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
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
