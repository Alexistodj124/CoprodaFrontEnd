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
import Ordenes from './pages/Ordenes.jsx'
import Produccion from './pages/Produccion.jsx'
import ProduccionDashboard from './pages/ProduccionDashboard.jsx'
import ProduccionProcesos from './pages/ProduccionProcesos.jsx'
import ReportesProduccion from './pages/ReportesProduccion.jsx'
import CoprodaLanding from './pages/CoprodaLanding.jsx'
import Bodega from './pages/Bodega.jsx'
import Bancos from './pages/Bancos.jsx'
import Abonos from './pages/Abonos.jsx'
import Stocks from './pages/Stocks.jsx'
import { RequireAuth, RequirePermiso } from './ProtectedRoutes.jsx'

const router = createBrowserRouter(
  [
    {
      path: 'coproda',
      element: <CoprodaLanding />,
    },
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
            <RequirePermiso permisos={['Clientes', 'ClientesVentas', 'ClientesFinanzas']}>
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
          path: 'ordenes',
          element: (
            <RequirePermiso permisos={["Produccion", "Ventas"]}>
              <Ordenes />
            </RequirePermiso>
          ),
        },
        {
          path: 'produccion-dashboard',
          element: (
            <RequirePermiso permiso="Produccion">
              <ProduccionDashboard />
            </RequirePermiso>
          ),
        },
        {
          path: 'reportes-produccion',
          element: (
            <RequirePermiso permiso="Produccion">
              <ReportesProduccion />
            </RequirePermiso>
          ),
        },
        {
          path: 'produccion-procesos',
          element: (
            <RequirePermiso permisos={['Compras', 'Productos']}>
              <ProduccionProcesos />
            </RequirePermiso>
          ),
        },
        {
          path: 'produccion',
          element: (
            <RequirePermiso permiso="Produccion">
              <Produccion />
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
        {
          path: 'stocks',
          element: (
            <RequirePermiso permisos={['maestro']}>
              <Stocks />
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
