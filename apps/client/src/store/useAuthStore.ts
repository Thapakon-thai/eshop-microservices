import { create } from 'zustand'
import Cookies from 'js-cookie'

interface AuthState {
  isAuthenticated: boolean
  checkAuth: () => void
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!Cookies.get('token'),
  checkAuth: () => set({ isAuthenticated: !!Cookies.get('token') }),
  login: (token: string) => {
    Cookies.set('token', token, { expires: 7 })
    set({ isAuthenticated: true })
  },
  logout: () => {
    Cookies.remove('token')
    set({ isAuthenticated: false })
  },
}))
