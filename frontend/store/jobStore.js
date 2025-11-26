import { create } from 'zustand'
import api from '@/utils/api'

const useJobStore = create((set) => ({
  jobs: [],
  currentJob: null,
  loading: false,

  fetchJobs: async (filters = {}) => {
    set({ loading: true })
    try {
      const response = await api.get('/jobs', { params: filters })
      set({ jobs: response.data, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Failed to fetch jobs:', error)
    }
  },

  scrapeJob: async (url) => {
    set({ loading: true })
    try {
      const response = await api.post('/jobs/scrape', { url })
      set((state) => ({
        jobs: [response.data, ...state.jobs],
        loading: false
      }))
      return { success: true, job: response.data }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.response?.data?.error || 'Scraping failed' }
    }
  },

  getJob: async (jobId) => {
    set({ loading: true })
    try {
      const response = await api.get(`/jobs/${jobId}`)
      set({ currentJob: response.data, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Failed to fetch job:', error)
    }
  }
}))

export default useJobStore
