import { create } from 'zustand'
import Cookies from 'js-cookie'

interface User {
  name: string
  email: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  checkAuth: () => void
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!Cookies.get('token'),
  user: (() => {
    try {
      const stored = Cookies.get('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  checkAuth: () => {
    const token = Cookies.get('token')
    const userCookie = Cookies.get('user')
    let user = null
    try {
      user = userCookie ? JSON.parse(userCookie) : null
    } catch {}
    set({ isAuthenticated: !!token, user })
  },
  login: (token: string, user: User) => {
    Cookies.set('token', token, { expires: 7 })
    Cookies.set('user', JSON.stringify(user), { expires: 7 })
    set({ isAuthenticated: true, user })
  },
  logout: () => {
    Cookies.remove('token')
    Cookies.remove('user')
    set({ isAuthenticated: false, user: null })
  },
}))
