import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usuariosApi } from '../services/api'
import { Card, Button, Modal, Input, Select, Table, PageHeader, Spinner } from '../components/UI'

const empty = { nome: '', sobrenome: '', email: '', senha: '', nivel: 'operador' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const load = () => usuariosApi.listar().then(r => setUsuarios(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.nome || !form.sobrenome || !form.email || !form.senha) {
      setErro('Preencha todos os campos')
      return
    }
    setSaving(true)
    setErro('')
    try {
      await usuariosApi.criar(form)
      setModal(false)
      setForm(empty)
      load()
    } catch (e) {
      setErro(e.response?.data?.detail || 'Erro ao criar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await usuariosApi.deletar(id)
        load()
      } catch (e) {
        alert(e.response?.data?.detail || 'Erro ao deletar usuário')
      }
    }
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'nivel', label: 'Nível' },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <Button
          onClick={() => handleDelete(row.id)}
          variant="danger"
          size="sm"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Trash2 size={14} /> Deletar
        </Button>
      )
    }
  ]

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Gerenciar usuários do sistema"
        action={<Button onClick={() => { setForm(empty); setErro(''); setModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Novo Usuário</Button>}
      />

      <Card>
        <Table
          columns={columns}
          data={usuarios.map(u => ({
            ...u,
            nome: `${u.nome} ${u.sobrenome}`
          }))}
          emptyMsg="Nenhum usuário cadastrado"
        />
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Novo Usuário">
        {erro && <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '13px', color: '#fca5a5' }}>{erro}</div>}
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input label="Sobrenome" value={form.sobrenome} onChange={(e) => setForm({ ...form, sobrenome: e.target.value })} />
        </div>
        
        <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ marginBottom: '16px' }} />
        <Input label="Senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} style={{ marginBottom: '16px' }} />
        
        <Select label="Nível" value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })} style={{ marginBottom: '20px' }}>
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </Select>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Criar Usuário'}</Button>
          <Button onClick={() => setModal(false)} variant="secondary">Cancelar</Button>
        </div>
      </Modal>
    </>
  )
}
