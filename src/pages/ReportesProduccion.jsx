import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { API_BASE_URL } from '../config/api'

const getProductoNombre = (orden) =>
  orden?.producto?.nombre ??
  orden?.producto_nombre ??
  orden?.productoNombre ??
  '—'

const getCantidadPlaneada = (orden) =>
  orden?.cantidad_planeada ??
  orden?.cantidadPlaneada ??
  orden?.cantidad ??
  '—'

const sumProcesos = (procesos, field) =>
  (procesos || []).reduce((acc, item) => {
    const value = Number(item?.[field])
    return acc + (Number.isFinite(value) ? value : 0)
  }, 0)

export default function ReportesProduccion() {
  const [ordenes, setOrdenes] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [estadoFiltro, setEstadoFiltro] = React.useState('')
  const [prioridadFiltro, setPrioridadFiltro] = React.useState('')

  const cargarOrdenes = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE_URL}/ordenes-produccion`)
      if (!res.ok) throw new Error('Error al obtener órdenes de producción')
      const data = await res.json()
      const ordenesBase = Array.isArray(data) ? data : []
      const ordenesConProcesos = await Promise.all(
        ordenesBase.map(async (orden) => {
          if (!orden?.id) return { ...orden, procesos: [] }
          try {
            const resProcesos = await fetch(
              `${API_BASE_URL}/ordenes-produccion/${orden.id}/procesos`
            )
            if (!resProcesos.ok) throw new Error('Error al obtener procesos')
            const procesos = await resProcesos.json()
            return { ...orden, procesos: procesos || [] }
          } catch (err) {
            console.error(err)
            return { ...orden, procesos: [] }
          }
        })
      )
      setOrdenes(ordenesConProcesos)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    cargarOrdenes()
  }, [])

  const estadosDisponibles = React.useMemo(() => {
    const set = new Set(
      ordenes
        .map((o) => String(o?.estado ?? '').trim())
        .filter(Boolean)
    )
    return Array.from(set)
  }, [ordenes])

  const prioridadesDisponibles = React.useMemo(() => {
    const set = new Set(
      ordenes
        .map((o) => String(o?.prioridad ?? '').trim())
        .filter(Boolean)
    )
    return Array.from(set)
  }, [ordenes])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return ordenes.filter((orden) => {
      if (estadoFiltro && String(orden?.estado ?? '') !== estadoFiltro) return false
      if (prioridadFiltro && String(orden?.prioridad ?? '') !== prioridadFiltro) return false
      if (!q) return true
      const codigo = String(orden?.codigo ?? '').toLowerCase()
      const producto = getProductoNombre(orden).toLowerCase()
      return codigo.includes(q) || producto.includes(q)
    })
  }, [ordenes, estadoFiltro, prioridadFiltro, query])

  const resumen = React.useMemo(() => {
    const total = filtered.length
    const byEstado = filtered.reduce((acc, orden) => {
      const estado = String(orden?.estado ?? '—')
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})
    return { total, byEstado }
  }, [filtered])

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, px: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Reportes de producción
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={cargarOrdenes}
            disabled={loading}
          >
            Recargar
          </Button>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Buscar por código o producto"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <TextField
                select
                label="Estado"
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">Todos</MenuItem>
                {estadosDisponibles.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Prioridad"
                value={prioridadFiltro}
                onChange={(e) => setPrioridadFiltro(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {prioridadesDisponibles.map((prioridad) => (
                  <MenuItem key={prioridad} value={prioridad}>
                    {prioridad}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Total: ${resumen.total}`} />
              {Object.entries(resumen.byEstado).map(([estado, count]) => (
                <Chip key={estado} label={`${estado}: ${count}`} variant="outlined" />
              ))}
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cant. planeada</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Entrada</TableCell>
                    <TableCell align="right">Salida</TableCell>
                    <TableCell align="right">Pérdida</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Typography variant="body2" color="text.secondary">
                          No hay órdenes para mostrar.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((orden) => {
                      const procesos = orden?.procesos || []
                      const totalEntrada = sumProcesos(procesos, 'cantidad_entrada')
                      const totalSalida = sumProcesos(procesos, 'cantidad_salida')
                      const totalPerdida = sumProcesos(procesos, 'cantidad_perdida')
                      return (
                        <TableRow key={orden?.id ?? orden?.codigo}>
                          <TableCell>{orden?.codigo ?? '—'}</TableCell>
                          <TableCell>{getProductoNombre(orden)}</TableCell>
                          <TableCell>{getCantidadPlaneada(orden)}</TableCell>
                          <TableCell>{orden?.prioridad ?? '—'}</TableCell>
                          <TableCell>{orden?.estado ?? '—'}</TableCell>
                          <TableCell align="right">{totalEntrada}</TableCell>
                          <TableCell align="right">{totalSalida}</TableCell>
                          <TableCell align="right">{totalPerdida}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
