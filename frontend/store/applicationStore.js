import { create } from 'zustand'
import api from '@/utils/api'

export const useApplicationStore = create((set) => ({
  applications: [],
  stats: null,
  loading: false,

  fetchApplications: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/apply/logs')
      set({ applications: response.data, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Failed to fetch applications:', error)
    }
  },

  startApplication: async (jobId, resumeId, coverLetter) => {
    set({ loading: true })
    try {
      const response = await api.post('/apply/start', {
        jobId,
        resumeId,
        coverLetter
      })
      set({ loading: false })
      return { success: true, data: response.data }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.response?.data?.error || 'Application failed' }
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/apply/stats')
      set({ stats: response.data })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }
}))
