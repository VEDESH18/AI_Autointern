import { create } from 'zustand'
import api from '@/utils/api'

const useNotificationStore = create((set, get) => ({
  notifications: [
    {
      id: 1,
      type: 'success',
      title: 'Application Submitted',
      message: 'Your application to Google was successfully submitted',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'New Job Match',
      message: 'We found 5 new jobs matching your profile',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Resume Update',
      message: 'Your resume needs updating for better matches',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Interview Scheduled',
      message: 'Interview with Microsoft scheduled for tomorrow',
      time: '5 hours ago',
      read: true
    }
  ],
  loading: false,
  unreadCount: 2,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/notifications')
      set({ 
        notifications: response.data,
        unreadCount: response.data.filter(n => !n.read).length,
        loading: false 
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ loading: false })
    }
  },

  markAsRead: (notificationId) => {
    const notifications = get().notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    set({ 
      notifications,
      unreadCount: notifications.filter(n => !n.read).length 
    })
  },

  markAllAsRead: () => {
    set({ 
      notifications: get().notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0 
    })
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications]
    set({ 
      notifications,
      unreadCount: notifications.filter(n => !n.read).length 
    })
  }
}))

export default useNotificationStore
