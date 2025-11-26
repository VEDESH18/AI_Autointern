import { create } from 'zustand'
import api from '@/utils/api'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, accessToken, refreshToken } = response.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      set({ user, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  },

  register: async (userData) => {
    set({ loading: true })
    try {
      const response = await api.post('/auth/register', userData)
      const { user, accessToken, refreshToken } = response.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      set({ user, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const response = await api.get('/auth/profile')
      set({ user: response.data, isAuthenticated: true })
    } catch (error) {
      set({ user: null, isAuthenticated: false })
    }
  }
}))
