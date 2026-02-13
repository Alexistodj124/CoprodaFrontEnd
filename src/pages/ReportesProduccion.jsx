import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
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

const ordenarProcesos = (procesos) =>
  procesos
    .slice()
    .sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0))

const getProcesoNombre = (proceso) =>
  proceso?.proceso_nombre ??
  proceso?.proceso?.nombre ??
  proceso?.proceso_id ??
  '—'

export default function ReportesProduccion() {
  const [ordenes, setOrdenes] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [openDetalle, setOpenDetalle] = React.useState(false)
  const [detalleOrden, setDetalleOrden] = React.useState(null)

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

  const filtered = React.useMemo(() => {
    return ordenes.filter((orden) => {
      const estado = String(orden?.estado ?? '').toUpperCase()
      return estado !== 'COMPLETADA' && estado !== 'CANCELADA'
    })
  }, [ordenes])

  const procesosColumns = React.useMemo(() => {
    const map = new Map()
    filtered.forEach((orden) => {
      ordenarProcesos(orden?.procesos || []).forEach((proc) => {
        const key = String(proc?.proceso_id ?? proc?.id ?? getProcesoNombre(proc))
        if (!map.has(key)) {
          map.set(key, {
            key,
            nombre: getProcesoNombre(proc),
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
            {error && <Alert severity="error">{error}</Alert>}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Estado</TableCell>
                    {procesosColumns.map((col) => (
                      <TableCell key={col.key} align="center">
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
                          No hay órdenes en producción.
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
                          <TableCell>{getProductoNombre(orden)}</TableCell>
                          <TableCell>{orden?.estado ?? '—'}</TableCell>
                          {procesosColumns.map((col) => {
                            const proc = procesosOrdenados.find(
                              (p) =>
                                String(p?.proceso_id ?? p?.id ?? getProcesoNombre(p)) === col.key
                            )
                            return (
                              <TableCell key={col.key} align="center">
                                {proc?.estado ?? '—'}
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
                  Producto: {getProductoNombre(detalleOrden)}
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
                          <TableCell>{getProcesoNombre(proc)}</TableCell>
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
