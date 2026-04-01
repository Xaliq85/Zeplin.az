import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

const storedUser = localStorage.getItem('zeplin_user')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  setUser: (user) => {
    localStorage.setItem('zeplin_user', JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
}))
