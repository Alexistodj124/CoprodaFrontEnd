// src/router.jsx
import * as React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './ui/AppLayout.jsx'
import Home from './pages/Home.jsx'
import SignIn from './pages/SignIn.jsx'
import NotFound from './pages/NotFound.jsx'
import Ventas from './pages/Ventas.jsx'
import Compras from './pages/Compras.jsx'
import Reportes from './pages/Reportes.jsx'
import Clientes from './pages/Clientes.jsx'
import Pedidos from './pages/Pedidos.jsx'
import Bodega from './pages/Bodega.jsx'
import Bancos from './pages/Bancos.jsx'
import Abonos from './pages/Abonos.jsx'
import { RequireAuth, RequirePermiso } from './ProtectedRoutes.jsx'

const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: (
            <RequireAuth>
              <Home />
            </RequireAuth>
          ),
        },
        { path: 'signin', element: <SignIn /> },
        {
          path: 'ventas',
          element: (
            <RequirePermiso permiso="Ventas">
              <Ventas />
            </RequirePermiso>
          ),
        },
        {
          path: 'compras',
          element: (
            <RequirePermiso permisos={['Compras', 'Productos']}>
              <Compras />
            </RequirePermiso>
          ),
        },
        {
          path: 'reportes',
          element: (
            <RequirePermiso permiso="Reportes">
              <Reportes />
            </RequirePermiso>
          ),
        },
        {
          path: 'clientes',
          element: (
            <RequirePermiso permiso="Clientes">
              <Clientes />
            </RequirePermiso>
          ),
        },
        {
          path: 'pedidos',
          element: (
            <RequirePermiso permiso="Pedidos">
              <Pedidos />
            </RequirePermiso>
          ),
        },
        {
          path: 'bodega',
          element: (
            <RequirePermiso permiso="Bodega">
              <Bodega />
            </RequirePermiso>
          ),
        },
        {
          path: 'bancos',
          element: (
            <RequirePermiso permiso="Bancos">
              <Bancos />
            </RequirePermiso>
          ),
        },
        {
          path: 'abonos',
          element: (
            <RequirePermiso permiso="Abonos">
              <Abonos />
            </RequirePermiso>
          ),
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    basename: '/COPRODA',
  }
)

export default router
