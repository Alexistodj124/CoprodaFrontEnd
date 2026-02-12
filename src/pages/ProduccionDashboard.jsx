import * as React from 'react'
import { Grid, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
import AddBoxIcon from '@mui/icons-material/AddBox'
import ExtensionIcon from '@mui/icons-material/Extension'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ScienceIcon from '@mui/icons-material/Science'
import ModuleCard from '../components/ModuleCard'
import { useAuth } from '../context/AuthContext'

const modules = [
  {
    to: '/ordenes',
    permiso: 'Produccion',
    altPermisos: ['Ventas'],
    title: 'Ordenes',
    icon: AssignmentIcon,
    subtitle: 'Órdenes y seguimiento de producción',
  },
  {
    to: '/produccion',
    permiso: 'Produccion',
    title: 'Producción',
    icon: PrecisionManufacturingIcon,
    subtitle: 'Crear y gestionar órdenes de producción',
  },
  {
    to: '/produccion-procesos?tipo=producto',
    permiso: 'Compras',
    altPermisos: ['Productos'],
    title: 'Agregar Producto',
    icon: AddBoxIcon,
    subtitle: 'Asignar procesos y componentes',
  },
  {
    to: '/produccion-procesos?tipo=componente',
    permiso: 'Compras',
    altPermisos: ['Productos'],
    title: 'Agregar Componente',
    icon: ExtensionIcon,
    subtitle: 'Asignar procesos a componentes',
  },
  {
    to: '/stocks?tab=materias',
    permiso: 'maestro',
    title: 'Stocks Materia Prima',
    icon: ScienceIcon,
    subtitle: 'Stock de materias primas',
  },
  {
    to: '/stocks?tab=componentes',
    permiso: 'maestro',
    title: 'Stocks Componentes',
    icon: Inventory2Icon,
    subtitle: 'Stock de componentes y sub-ensambles',
  },
]

export default function ProduccionDashboard() {
  const { hasAnyPermiso } = useAuth()
  const visibleModules = modules.filter((m) => {
    if (!m.permiso && (!m.altPermisos || m.altPermisos.length === 0)) return true
    const permisos = m.altPermisos ? [m.permiso, ...m.altPermisos] : [m.permiso]
    return hasAnyPermiso(permisos.filter(Boolean))
  })

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Producción
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
