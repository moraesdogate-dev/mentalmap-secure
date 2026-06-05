import { create } from 'zustand'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      })
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      
      set({
        user,
        token,
        isLoading: false
      })
      
      return true
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Erro ao fazer login',
        isLoading: false
      })
      return false
    }
  },

  // Registrar
  register: async (username, email, password, confirmPassword) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        confirmPassword
      })
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      
      set({
        user,
        token,
        isLoading: false
      })
      
      return true
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Erro ao registrar',
        isLoading: false
      })
      return false
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    set({
      user: null,
      token: null,
      error: null
    })
  },

  // Obter usuário atual
  getMe: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      set({ user: response.data.user })
    } catch (error) {
      localStorage.removeItem('token')
      set({ token: null, user: null })
    }
  },

  // Criar novo mapa mental
  createMentalMap: async (title, description) => {
    const token = get().token
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(
        `${API_URL}/mentalmap`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar mapa'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Obter todos os mapas do usuário
  getMentalMaps: async () => {
    const token = get().token
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/mentalmap`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao obter mapas'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Obter um mapa específico
  getMentalMap: async (mapId) => {
    const token = get().token
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/mentalmap/${mapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao obter mapa'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Atualizar mapa mental
  updateMentalMap: async (mapId, title, description, cards, connections) => {
    const token = get().token
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put(
        `${API_URL}/mentalmap/${mapId}`,
        { title, description, cards, connections },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar mapa'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Deletar mapa mental
  deleteMentalMap: async (mapId) => {
    const token = get().token
    set({ isLoading: true, error: null })
    try {
      await axios.delete(`${API_URL}/mentalmap/${mapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar mapa'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  }
}))
