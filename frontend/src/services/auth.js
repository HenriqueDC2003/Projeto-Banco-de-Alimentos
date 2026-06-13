/**
 * Serviço de autenticação com localStorage
 */

const TOKEN_KEY = 'auth_token'
const USUARIO_KEY = 'auth_usuario'

export const authService = {
  /**
   * Realiza o login com e-mail e senha
   * @param {string} email
   * @param {string} senha
   * @returns {Promise<{token: string, usuario: object}>}
   */
  async login(email, senha) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: email,
          password: senha
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erro ao fazer login')
      }

      const data = await response.json()
      
      localStorage.setItem(TOKEN_KEY, data.access_token)
      localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario))
      
      return data
    } catch (error) {
      console.error('Erro de login:', error)
      throw error
    }
  },

  /**
   * Faz logout removendo dados do localStorage
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
  },

  /**
   * Obtém o token JWT do localStorage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Obtém os dados do usuário armazenado
   * @returns {object|null}
   */
  getUsuario() {
    const usuario = localStorage.getItem(USUARIO_KEY)
    return usuario ? JSON.parse(usuario) : null
  },

  /**
   * Verifica se o usuário está logado
   * @returns {boolean}
   */
  isLogado() {
    return !!this.getToken()
  },

  /**
   * Verifica se o usuário é admin
   * @returns {boolean}
   */
  isAdmin() {
    const usuario = this.getUsuario()
    return usuario && usuario.nivel === 'admin'
  },

  /**
   * Altera a senha do usuário logado
   * @param {string} senhaAtual
   * @param {string} senhaNova
   * @returns {Promise}
   */
  async alterarSenha(senhaAtual, senhaNova) {
    const token = this.getToken()
    if (!token) throw new Error('Não autenticado')

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/alterar-senha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        senha_atual: senhaAtual,
        senha_nova: senhaNova
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Erro ao alterar senha')
    }

    return await response.json()
  }
}

export default authService
