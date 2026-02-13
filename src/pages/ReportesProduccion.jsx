import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { API_BASE_URL } from '../config/api'

const getProductoNombre = (orden, productosById) =>
  orden?.producto?.nombre ??
  productosById[String(orden?.producto_id ?? orden?.productoId ?? '')]?.nombre ??
  orden?.producto_nombre ??
  orden?.productoNombre ??
  '—'

const getCantidadPlaneada = (orden) =>
  orden?.cantidad_planeada ??
  orden?.cantidadPlaneada ??
  orden?.cantidad ??
  '—'

const getOrdenFecha = (orden) =>
  orden?.fecha_inicio ??
  orden?.fecha_creacion ??
  orden?.created_at ??
  orden?.fecha ??
  null

const ordenarProcesos = (procesos) =>
  procesos
    .slice()
    .sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0))

const getProcesoNombre = (proceso, procesosById) =>
  procesosById[String(proceso?.proceso_id ?? proceso?.procesoId ?? '')]?.nombre ??
  proceso?.proceso_nombre ??
  proceso?.proceso?.nombre ??
  proceso?.proceso_id ??
  '—'

const renderEstadoIcon = (estadoRaw) => {
  const estado = String(estadoRaw ?? '').toUpperCase()
  if (estado === 'COMPLETADO' || estado === 'COMPLETADA') {
    return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
  }
  if (estado === 'EN_PROCESO') {
    return <ScheduleIcon fontSize="small" sx={{ color: 'warning.main' }} />
  }
  if (estado === 'PENDIENTE') {
    return <HourglassEmptyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
  }
  return '—'
}

export default function ReportesProduccion() {
  const [ordenes, setOrdenes] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [openDetalle, setOpenDetalle] = React.useState(false)
  const [detalleOrden, setDetalleOrden] = React.useState(null)
  const [estadoFiltro, setEstadoFiltro] = React.useState('')
  const [fechaDesde, setFechaDesde] = React.useState('')
  const [fechaHasta, setFechaHasta] = React.useState('')
  const [procesosCatalogo, setProcesosCatalogo] = React.useState([])
  const [productos, setProductos] = React.useState([])
  const [vista, setVista] = React.useState('compacta')

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

  const cargarProcesosCatalogo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/procesos`)
      if (!res.ok) throw new Error('Error al obtener procesos')
      const data = await res.json()
      setProcesosCatalogo(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      setProductos(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  React.useEffect(() => {
    cargarOrdenes()
    cargarProcesosCatalogo()
    cargarProductos()
  }, [])

  const estadosDisponibles = React.useMemo(() => {
    const set = new Set(
      ordenes
        .map((o) => String(o?.estado ?? '').trim())
        .filter(Boolean)
    )
    return Array.from(set)
  }, [ordenes])

  const procesosById = React.useMemo(() => {
    return (procesosCatalogo || []).reduce((acc, item) => {
      if (item?.id != null) acc[String(item.id)] = item
      return acc
    }, {})
  }, [procesosCatalogo])

  const productosById = React.useMemo(() => {
    return (productos || []).reduce((acc, item) => {
      if (item?.id != null) acc[String(item.id)] = item
      return acc
    }, {})
  }, [productos])

  const filtered = React.useMemo(() => {
    return ordenes.filter((orden) => {
      if (estadoFiltro && String(orden?.estado ?? '') !== estadoFiltro) return false

      const rawFecha = getOrdenFecha(orden)
      const fecha = rawFecha ? new Date(rawFecha) : null
      if (fechaDesde) {
        if (!fecha) return false
        const desde = new Date(`${fechaDesde}T00:00:00`)
        if (fecha < desde) return false
      }
      if (fechaHasta) {
        if (!fecha) return false
        const hasta = new Date(`${fechaHasta}T23:59:59`)
        if (fecha > hasta) return false
      }

      return true
    })
  }, [ordenes, estadoFiltro, fechaDesde, fechaHasta])

  const procesosColumns = React.useMemo(() => {
    const map = new Map()
    filtered.forEach((orden) => {
      ordenarProcesos(orden?.procesos || []).forEach((proc) => {
        const key = String(
          proc?.proceso_id ?? proc?.procesoId ?? proc?.id ?? getProcesoNombre(proc, procesosById)
        )
        if (!map.has(key)) {
          map.set(key, {
            key,
            nombre: getProcesoNombre(proc, procesosById),
            orden: proc?.orden ?? 0,
          })
        }
      })
    })
    return Array.from(map.values()).sort((a, b) => a.orden - b.orden)
  }, [filtered])

  const handleOpenDetalle = (orden) => {
    setDetalleOrden(orden)
    setOpenDetalle(true)
  }

  const handleCloseDetalle = () => {
    setOpenDetalle(false)
  }

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
                label="Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <ToggleButtonGroup
                value={vista}
                exclusive
                size="small"
                onChange={(_, next) => next && setVista(next)}
                sx={{ ml: 'auto' }}
              >
                <ToggleButton value="compacta">Compacta</ToggleButton>
                <ToggleButton value="tabla">Tabla</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {vista === 'tabla' ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 600 }}>
                        Producto
                      </TableCell>
                      <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 600 }}>
                        Estado
                      </TableCell>
                      {procesosColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          {col.nombre}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2 + procesosColumns.length}>
                          <Typography variant="body2" color="text.secondary">
                            No hay órdenes para mostrar.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((orden) => {
                        const procesosOrdenados = ordenarProcesos(orden?.procesos || [])
                        return (
                          <TableRow
                            key={orden?.id ?? orden?.codigo}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleOpenDetalle(orden)}
                          >
                            <TableCell sx={{ backgroundColor: 'grey.200' }}>
                              {getProductoNombre(orden, productosById)}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: 'grey.200' }}>
                              {renderEstadoIcon(orden?.estado)}
                            </TableCell>
                            {procesosColumns.map((col) => {
                              const proc = procesosOrdenados.find(
                                (p) =>
                                  String(
                                    p?.proceso_id ??
                                      p?.procesoId ??
                                      p?.id ??
                                      getProcesoNombre(p, procesosById)
                                  ) === col.key
                              )
                              return (
                                <TableCell key={col.key} align="center">
                                  {renderEstadoIcon(proc?.estado)}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 600 }}>
                        Producto
                      </TableCell>
                      <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 600 }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Procesos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            No hay órdenes para mostrar.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((orden) => {
                        const procesosOrdenados = ordenarProcesos(orden?.procesos || [])
                        return (
                          <TableRow
                            key={orden?.id ?? orden?.codigo}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleOpenDetalle(orden)}
                          >
                            <TableCell sx={{ backgroundColor: 'grey.200' }}>
                              {getProductoNombre(orden, productosById)}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: 'grey.200' }}>
                              {renderEstadoIcon(orden?.estado)}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {procesosOrdenados.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary">
                                    Sin procesos
                                  </Typography>
                                ) : (
                                  procesosOrdenados.map((proc) => (
                                    <Chip
                                      key={proc.id}
                                      size="small"
                                      icon={renderEstadoIcon(proc?.estado)}
                                      label={getProcesoNombre(proc, procesosById)}
                                      variant="outlined"
                                    />
                                  ))
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </Paper>
      </Stack>

      <Dialog open={openDetalle} onClose={handleCloseDetalle} fullWidth maxWidth="lg">
        <DialogTitle>Detalle de orden</DialogTitle>
        <DialogContent dividers>
          {!detalleOrden ? (
            <Typography variant="body2" color="text.secondary">
              Selecciona una orden para ver sus procesos.
            </Typography>
          ) : (
            <>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Producto: {getProductoNombre(detalleOrden, productosById)}
                </Typography>
                <Typography variant="subtitle2">
                  Estado: {detalleOrden?.estado ?? '—'}
                </Typography>
                <Typography variant="subtitle2">
                  Cantidad planeada: {getCantidadPlaneada(detalleOrden)}
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Orden</TableCell>
                      <TableCell>Proceso</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Entrada</TableCell>
                      <TableCell align="right">Salida</TableCell>
                      <TableCell align="right">Pérdida</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordenarProcesos(detalleOrden?.procesos || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography variant="body2" color="text.secondary">
                            No hay procesos para esta orden.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      ordenarProcesos(detalleOrden?.procesos || []).map((proc) => (
                        <TableRow key={proc.id}>
                          <TableCell>{proc.orden ?? '—'}</TableCell>
                          <TableCell>{getProcesoNombre(proc, procesosById)}</TableCell>
                          <TableCell>{proc.estado ?? '—'}</TableCell>
                          <TableCell align="right">
                            {proc.cantidad_entrada ?? '—'}
                          </TableCell>
                          <TableCell align="right">
                            {proc.cantidad_salida ?? '—'}
                          </TableCell>
                          <TableCell align="right">
                            {proc.cantidad_perdida ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetalle}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
