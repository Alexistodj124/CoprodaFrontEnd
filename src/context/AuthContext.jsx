// src/context/AuthContext.jsx
import * as React from 'react'
import { API_BASE_URL } from '../config/api'

const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem('kiara_user')
      if (stored) return JSON.parse(stored)
      const legacy = localStorage.getItem('usuario')
      return legacy ? JSON.parse(legacy) : null
    } catch {
      return null
    }
  })
  const [permisosReady, setPermisosReady] = React.useState(() => {
    if (!user) return false
    if (user?.is_admin) return true
    if (user?.permisos_loaded) return true
    return Array.isArray(user?.permisos)
  })

  const normalizePermisos = React.useCallback((input, username) => {
    if (!input) return []
    if (Array.isArray(input)) {
      if (input.length === 0) return []
      if (typeof input[0] === 'string') {
        return input.filter(Boolean)
      }
      if (typeof input[0] === 'object') {
        const match =
          input.find((item) => item?.usuario === username || item?.username === username) ||
          input[0]
        const permisos = match?.permisos
        if (Array.isArray(permisos)) return permisos.filter(Boolean)
        if (typeof permisos === 'string' && permisos.trim()) return [permisos.trim()]
      }
      return []
    }
    if (typeof input === 'object') {
      const permisos = input?.permisos ?? input?.permissions
      if (Array.isArray(permisos)) return permisos.filter(Boolean)
      if (typeof permisos === 'string' && permisos.trim()) return [permisos.trim()]
    }
    return []
  }, [])

  const fetchPermisos = React.useCallback(
    async (username) => {
      if (!username) return []
      try {
        const res = await fetch(`${API_BASE_URL}/usuarios`)
        if (!res.ok) return []
        const data = await res.json()
        return normalizePermisos(data, username)
      } catch (err) {
        console.error('Error obteniendo permisos:', err)
        return []
      }
    },
    [normalizePermisos]
  )

  // 🟢 login: llama a tu /auth/login
  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Error en login:', errText)
      throw new Error('Credenciales inválidas')
    }

    const data = await res.json()
    // data: { id, username, is_admin }
    const normalizedUsername = data?.username ?? data?.usuario ?? username
    const permisos = await fetchPermisos(normalizedUsername)
    const nextUser = {
      ...data,
      username: normalizedUsername,
      permisos,
      permisos_loaded: true,
    }
    setUser(nextUser)
    localStorage.setItem('kiara_user', JSON.stringify(nextUser))
    localStorage.setItem('usuario', JSON.stringify(nextUser))
    setPermisosReady(true)
    return nextUser
  }

  // 🔴 logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('kiara_user')
    localStorage.removeItem('usuario')
    setPermisosReady(false)
  }

  const value = {
    user,
    isAdmin: !!user?.is_admin,
    permisos: user?.permisos || [],
    permisosReady,
    hasAnyPermiso: (required = []) => {
      if (!user) return false
      if (user?.is_admin) return true
      const userPerms = (user?.permisos || [])
        .map((permiso) => String(permiso || '').trim().toLowerCase())
        .filter(Boolean)
      if (userPerms.includes('maestro')) return true
      if (!required || required.length === 0) return true
      const normalizedRequired = required
        .map((permiso) => String(permiso || '').trim().toLowerCase())
        .filter(Boolean)
      return normalizedRequired.some((permiso) => userPerms.includes(permiso))
    },
    login,
    logout,
  }

  React.useEffect(() => {
    const syncPermisos = async () => {
      if (!user) {
        setPermisosReady(false)
        return
      }
      if (user?.is_admin || user?.permisos_loaded) {
        setPermisosReady(true)
        return
      }
      if (Array.isArray(user?.permisos) && user.permisos.length > 0) {
        setPermisosReady(true)
        return
      }
      const username = user?.username ?? user?.usuario
      const permisos = await fetchPermisos(username)
      const nextUser = { ...user, username, permisos, permisos_loaded: true }
      setUser(nextUser)
      localStorage.setItem('kiara_user', JSON.stringify(nextUser))
      localStorage.setItem('usuario', JSON.stringify(nextUser))
      setPermisosReady(true)
    }
    syncPermisos()
  }, [user, fetchPermisos])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar en cualquier componente
export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
