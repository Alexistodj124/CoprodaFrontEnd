// src/ui/AppLayout.jsx
import * as React from 'react'
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useAuth } from '../context/AuthContext'
import logoCoproda from '../assets/image.png'

export default function AppLayout() {
  const { user, logout, hasAnyPermiso } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()                               // limpia contexto + localStorage
    navigate('/signin', { replace: true }) // manda al login
  }

  const canAccess = (permiso) => hasAnyPermiso([permiso])

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: '#e60303ff', color: 'white' }}
      >
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }} variant="h6">
            <img
              src={logoCoproda}
              alt="Coproda"
              style={{ height: 50, display: 'block' }}
            />
          </Typography>

          {/* Navegación solo si está logueado */}
          {user && (
            <>
              <Button color="inherit" component={RouterLink} to="/">
                Inicio
              </Button>
              {canAccess('Compras') || canAccess('Productos') ? (
                <Button color="inherit" component={RouterLink} to="/compras">
                  Productos
                </Button>
              ) : null}
              {canAccess('Ventas') ? (
                <Button color="inherit" component={RouterLink} to="/ventas">
                  Ventas
                </Button>
              ) : null}
              {canAccess('Pedidos') ? (
                <Button color="inherit" component={RouterLink} to="/pedidos">
                  Pedidos
                </Button>
              ) : null}
              {canAccess('Produccion') ? (
                <Button color="inherit" component={RouterLink} to="/ordenes">
                  Ordenes
                </Button>
              ) : null}
              {canAccess('Bodega') ? (
                <Button color="inherit" component={RouterLink} to="/bodega">
                  Bodega
                </Button>
              ) : null}
              {canAccess('Clientes') || canAccess('ClientesVentas') || canAccess('ClientesFinanzas') ? (
                <Button color="inherit" component={RouterLink} to="/clientes">
                  Clientes
                </Button>
              ) : null}
              {canAccess('Abonos') ? (
                <Button color="inherit" component={RouterLink} to="/abonos">
                  Abonos
                </Button>
              ) : null}
              {canAccess('Bancos') ? (
                <Button color="inherit" component={RouterLink} to="/bancos">
                  Bancos
                </Button>
              ) : null}
              {canAccess('Reportes') ? (
                <Button color="inherit" component={RouterLink} to="/reportes">
                  Reportes
                </Button>
              ) : null}

              {/* Mostrar usuario + Logout */}
              <Typography
                variant="body2"
                sx={{ mx: 2, fontWeight: 500 }}
              >
                {user?.username || user?.usuario || ''}
              </Typography>

              <Button
                color="inherit"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </>
          )}

          {/* Si quisieras que en algún caso se vea el botón de login:
          {!user && (
            <Button color="inherit" component={RouterLink} to="/signin">
              Sign in
            </Button>
          )} */}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  )
}
