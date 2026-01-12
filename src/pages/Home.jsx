import * as React from 'react'
import { Grid, Typography } from '@mui/material'
import AreaChartIcon from '@mui/icons-material/AreaChart'
import ModuleCard from '../components/ModuleCard'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits'
import PortraitIcon from '@mui/icons-material/Portrait'
import InventoryIcon from '@mui/icons-material/Inventory2'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import PaymentsIcon from '@mui/icons-material/Payments'
import { useAuth } from '../context/AuthContext'

const modules = [
  { to: '/ventas', permiso: 'Ventas', title: 'Ventas', icon: PointOfSaleIcon, subtitle: 'Módulo de ventas y pedidos rápidos' },
  { to: '/reportes', permiso: 'Reportes', title: 'Reportes', icon: AreaChartIcon, subtitle: 'Reportes de ventas y desempeño' },
  { to: '/compras', permiso: 'Compras', altPermisos: ['Productos'], title: 'Compras', icon: ProductionQuantityLimitsIcon, subtitle: 'Compra y carga de productos' },
  { to: '/pedidos', permiso: 'Pedidos', title: 'Pedidos', icon: AssignmentIcon, subtitle: 'Órdenes generadas y detalle' },
  { to: '/bodega', permiso: 'Bodega', title: 'Bodega', icon: WarehouseIcon, subtitle: 'Inventario y stock' },
  { to: '/clientes', permiso: 'Clientes', title: 'Clientes', icon: PortraitIcon, subtitle: 'Historial y abonos por cliente' },
  { to: '/abonos', permiso: 'Abonos', title: 'Abonos', icon: PaymentsIcon, subtitle: 'Abonos aplicados por cliente' },
  { to: '/bancos', permiso: 'Bancos', title: 'Bancos', icon: AccountBalanceIcon, subtitle: 'Pagos sin asignar' },
  { to: '/', title: 'Inicio', icon: InventoryIcon, subtitle: 'Volver al panel principal' },
]

export default function Home() {
  const { hasAnyPermiso } = useAuth()
  const visibleModules = modules.filter((m) => {
    if (m.to === '/') return true
    if (!m.permiso && (!m.altPermisos || m.altPermisos.length === 0)) return true
    const permisos = m.altPermisos ? [m.permiso, ...m.altPermisos] : [m.permiso]
    return hasAnyPermiso(permisos.filter(Boolean))
  })

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Módulos
      </Typography>

      <Grid container spacing={2}>
        {visibleModules.map((m) => (
          <Grid key={m.to} item xs={12} sm={12} md={12} lg={6}>

            <ModuleCard {...m} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}
