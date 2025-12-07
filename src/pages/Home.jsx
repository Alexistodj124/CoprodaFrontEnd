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

const modules = [
  { to: '/ventas', title: 'Ventas', icon: PointOfSaleIcon, subtitle: 'Módulo de ventas y pedidos rápidos' },
  { to: '/reportes', title: 'Reportes', icon: AreaChartIcon, subtitle: 'Reportes de ventas y desempeño' },
  { to: '/compras', title: 'Compras', icon: ProductionQuantityLimitsIcon, subtitle: 'Compra y carga de productos' },
  { to: '/pedidos', title: 'Pedidos', icon: AssignmentIcon, subtitle: 'Órdenes generadas y detalle' },
  { to: '/bodega', title: 'Bodega', icon: WarehouseIcon, subtitle: 'Inventario y stock' },
  { to: '/clientes', title: 'Clientes', icon: PortraitIcon, subtitle: 'Historial y abonos por cliente' },
  { to: '/bancos', title: 'Bancos', icon: AccountBalanceIcon, subtitle: 'Pagos sin asignar' },
  { to: '/', title: 'Inicio', icon: InventoryIcon, subtitle: 'Volver al panel principal' },
]

export default function Home() {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Módulos
      </Typography>

      <Grid container spacing={2}>
        {modules.map((m) => (
          <Grid key={m.to} item xs={12} sm={12} md={12} lg={6}>

            <ModuleCard {...m} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}
