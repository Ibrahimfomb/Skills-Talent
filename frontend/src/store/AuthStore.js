import { create } from 'zustand'

const STORAGE_KEY = 'ss_auth'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Called after login or register — data contains user fields + token
  setAuth: (data) => {
    const { token, ...user } = data
    if (token) localStorage.setItem('authToken', token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, isAuthenticated: false })
  },

  // Called on app mount to restore session from localStorage
  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const token = localStorage.getItem('authToken')
      if (raw && token) {
        set({ user: JSON.parse(raw), isAuthenticated: true })
      }
    } catch {
      // corrupted storage — ignore
    }
  },
}))
