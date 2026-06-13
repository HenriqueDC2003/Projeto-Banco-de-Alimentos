import axios from 'axios'
import { authService } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor para adicionar token JWT em todas requisições
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      authService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

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

export const usuariosApi = {
  listar: () => api.get('/usuarios'),
  criar: (data) => api.post('/usuarios', data),
  deletar: (id) => api.delete(`/usuarios/${id}`)
}
