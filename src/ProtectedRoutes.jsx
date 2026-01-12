// src/ProtectedRoutes.jsx
import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Solo requiere estar logueado
export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // si no hay usuario -> manda a /signin
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return children
}

// Requiere permisos específicos (o Maestro/admin)
export function RequirePermiso({ children, permisos = [], permiso }) {
  const { user, hasAnyPermiso, permisosReady } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (!permisosReady) {
    return null
  }

  const required = permisos.length ? permisos : permiso ? [permiso] : []
  if (required.length > 0 && !hasAnyPermiso(required)) {
    // logueado pero sin permiso -> lo mandamos al home
    return <Navigate to="/" replace />
  }

  return children
}
