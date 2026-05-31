import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const alimentosApi = {
  listar: () => api.get('/alimentos'),
  criar: (data) => api.post('/alimentos', data),
  atualizar: (id, data) => api.put(`/alimentos/${id}`, data),
  deletar: (id) => api.delete(`/alimentos/${id}`)
}

export const lotesApi = {
  listar: () => api.get('/lotes'),
  criar: (data) => api.post('/lotes', data),
  vencendo: (dias = 30) => api.get(`/lotes/vencendo?dias=${dias}`),
  marcarEstragado: (id) => api.patch(`/lotes/${id}/estragado`)
}

export const distribuicoesApi = {
  listar: () => api.get('/distribuicoes'),
  criar: (data) => api.post('/distribuicoes', data),
  resumoMensal: (ano, mes) => api.get(`/distribuicoes/resumo-mensal?ano=${ano}&mes=${mes}`)
}

export const auxiliaresApi = {
  tipos: () => api.get('/tipos'),
  criarTipo: (data) => api.post('/tipos', data),
  marcas: () => api.get('/marcas'),
  unidades: () => api.get('/unidades'),
  parceiros: () => api.get('/parceiros'),
  criarParceiro: (data) => api.post('/parceiros', data)
}

export default api
