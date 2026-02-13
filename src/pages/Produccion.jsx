import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

const PRIORIDADES = [
  { id: 'ALTA', label: 'ALTA' },
  { id: 'MEDIA', label: 'MEDIA' },
  { id: 'BAJA', label: 'BAJA' },
]

const getProductoNombre = (orden) =>
  orden?.producto?.nombre ??
  orden?.producto_nombre ??
  orden?.productoNombre ??
  '—'

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

export default function Produccion() {
  const { hasAnyPermiso } = useAuth()
  const canDeleteOrden = hasAnyPermiso(['maestro'])
  const [ordenes, setOrdenes] = React.useState([])
  const [loadingOrdenes, setLoadingOrdenes] = React.useState(false)
  const [errorOrdenes, setErrorOrdenes] = React.useState('')
  const [productos, setProductos] = React.useState([])
  const [procesosCatalogo, setProcesosCatalogo] = React.useState([])
  const [selectedOrdenId, setSelectedOrdenId] = React.useState(null)
  const [detalleOrden, setDetalleOrden] = React.useState(null)
  const [loadingDetalle, setLoadingDetalle] = React.useState(false)
  const [openDetalle, setOpenDetalle] = React.useState(false)
  const [openCrearOrden, setOpenCrearOrden] = React.useState(false)
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })

  const [form, setForm] = React.useState({
    codigo: '',
    productoId: '',
    cantidadPlaneada: '',
    prioridad: 'MEDIA',
    notas: '',
  })

  const [completarInputs, setCompletarInputs] = React.useState({})

  const productosById = React.useMemo(() => {
    return productos.reduce((acc, item) => {
      if (item?.id != null) acc[String(item.id)] = item
      return acc
    }, {})
  }, [productos])

  const procesosById = React.useMemo(() => {
    return procesosCatalogo.reduce((acc, item) => {
      if (item?.id != null) acc[String(item.id)] = item
      return acc
    }, {})
  }, [procesosCatalogo])

  const cargarOrdenes = async () => {
    try {
      setLoadingOrdenes(true)
      setErrorOrdenes('')
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
      setErrorOrdenes('No se pudieron cargar las órdenes')
    } finally {
      setLoadingOrdenes(false)
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

  const cargarDetalleOrden = async (id) => {
    if (!id) return
    try {
      setLoadingDetalle(true)
      const res = await fetch(`${API_BASE_URL}/ordenes-produccion/${id}`)
      if (!res.ok) throw new Error('Error al obtener detalle de orden')
      const data = await res.json()

      const resProcesos = await fetch(`${API_BASE_URL}/ordenes-produccion/${id}/procesos`)
      if (!resProcesos.ok) throw new Error('Error al obtener procesos de orden')
      const procesos = await resProcesos.json()

      setDetalleOrden({ ...data, procesos: procesos || [] })
    } catch (err) {
      console.error(err)
      setDetalleOrden(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  React.useEffect(() => {
    cargarOrdenes()
    cargarProductos()
    cargarProcesosCatalogo()
  }, [])

  const handleSelectOrden = (orden) => {
    const id = orden?.id
    if (!id) return
    setSelectedOrdenId(id)
    cargarDetalleOrden(id)
    setOpenDetalle(true)
  }

  const handleCloseDetalle = () => {
    setOpenDetalle(false)
  }

  const handleOpenCrearOrden = () => {
    setOpenCrearOrden(true)
  }

  const handleCloseCrearOrden = () => {
    setOpenCrearOrden(false)
  }

  const handleEliminarOrden = async (ordenId) => {
    if (!ordenId) return
    const ok = window.confirm('¿Eliminar esta orden de producción?')
    if (!ok) return
    try {
      const res = await fetch(`${API_BASE_URL}/ordenes-produccion/${ordenId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo eliminar la orden'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }
      setSnack({ open: true, msg: 'Orden eliminada', severity: 'success' })
      if (selectedOrdenId === ordenId) {
        setSelectedOrdenId(null)
        setDetalleOrden(null)
      }
      await cargarOrdenes()
    } catch (err) {
      console.error(err)
      setSnack({
        open: true,
        msg: 'Error de red al eliminar orden',
        severity: 'error',
      })
    }
  }

  const handleCrearOrden = async (event) => {
    event.preventDefault()
    const codigo = form.codigo.trim()
    const productoId = Number(form.productoId)
    const cantidadPlaneada = Number(form.cantidadPlaneada)
    const prioridad = form.prioridad
    const notas = form.notas.trim() || null

    if (!codigo || !productoId || !cantidadPlaneada) {
      setSnack({
        open: true,
        msg: 'Código, producto y cantidad planeada son requeridos',
        severity: 'error',
      })
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/ordenes-produccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          producto_id: productoId,
          cantidad_planeada: cantidadPlaneada,
          prioridad,
          notas,
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'Error al crear orden de producción'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      const created = await res.json()
      setSnack({ open: true, msg: 'Orden creada exitosamente', severity: 'success' })
      setOpenCrearOrden(false)
      setForm({
        codigo: '',
        productoId: '',
        cantidadPlaneada: '',
        prioridad: 'MEDIA',
        notas: '',
      })
      await cargarOrdenes()
      if (created?.id) {
        setSelectedOrdenId(created.id)
        await cargarDetalleOrden(created.id)
        try {
          const resProcesos = await fetch(
            `${API_BASE_URL}/ordenes-produccion/${created.id}/procesos`
          )
          if (!resProcesos.ok) throw new Error('Error al obtener procesos de orden')
          const procesos = await resProcesos.json()
          const procesosOrdenados = ordenarProcesos(procesos || [])
          const firstProc = procesosOrdenados[0]
          if (firstProc?.id) {
            await handleAccionProceso(firstProc.id, 'iniciar', null, created.id)
          }
        } catch (err) {
          console.error(err)
        }
      }
    } catch (err) {
      console.error(err)
      setSnack({
        open: true,
        msg: 'Error de red al crear orden',
        severity: 'error',
      })
    }
  }

  const handleAccionProceso = async (procesoOrdenId, accion, payload, ordenIdOverride) => {
    const ordenId = ordenIdOverride ?? selectedOrdenId
    if (!ordenId || !procesoOrdenId) return
    try {
      const res = await fetch(
        `${API_BASE_URL}/ordenes-produccion/${ordenId}/procesos/${procesoOrdenId}/${accion}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload ? JSON.stringify(payload) : null,
        }
      )

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo actualizar el proceso'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      setSnack({ open: true, msg: 'Proceso actualizado', severity: 'success' })
      await cargarDetalleOrden(ordenId)
      await cargarOrdenes()
    } catch (err) {
      console.error(err)
      setSnack({
        open: true,
        msg: 'Error de red al actualizar proceso',
        severity: 'error',
      })
    }
  }

  const handleActualizarProceso = async (proc) => {
    if (!selectedOrdenId || !proc?.id) return
    const inputs = completarInputs[proc.id] || {}
    const procesosOrdenados = ordenarProcesos(detalleOrden?.procesos || [])
    const idx = procesosOrdenados.findIndex((p) => p.id === proc.id)
    const prevProc = idx > 0 ? procesosOrdenados[idx - 1] : null
    const entradaAuto =
      Number(proc.cantidad_entrada) ||
      (idx === 0
        ? Number(detalleOrden?.cantidad_planeada || 0)
        : Number(prevProc?.cantidad_salida || 0))
    const salidaInput =
      inputs.cantidad_salida === '' || inputs.cantidad_salida == null
        ? null
        : Number(inputs.cantidad_salida)
    const perdidaInput =
      inputs.cantidad_perdida === '' || inputs.cantidad_perdida == null
        ? null
        : Number(inputs.cantidad_perdida)
    const salidaTotal = Number.isFinite(salidaInput)
      ? Number(proc.cantidad_salida || 0) + salidaInput
      : Number(proc.cantidad_salida || 0)
    const perdidaTotal = Number.isFinite(perdidaInput)
      ? Number(proc.cantidad_perdida || 0) + perdidaInput
      : Number(proc.cantidad_perdida || 0)

    if (!Number.isFinite(entradaAuto) || entradaAuto <= 0) {
      setSnack({ open: true, msg: 'Cantidad de entrada inválida', severity: 'error' })
      return
    }

    const objetivo = entradaAuto - (Number.isFinite(perdidaTotal) ? perdidaTotal : 0)
    const completar = Number.isFinite(objetivo) && salidaTotal >= objetivo

    if (String(proc.estado || '').toUpperCase() === 'PENDIENTE') {
      await handleAccionProceso(proc.id, 'iniciar')
    }

    const payload = {
      cantidad_entrada: entradaAuto,
      cantidad_salida: salidaTotal,
      ...(Number.isFinite(perdidaInput) ? { cantidad_perdida: Number(perdidaTotal) || 0 } : {}),
      ...(completar ? {} : { parcial: true }),
    }

    await handleAccionProceso(proc.id, 'completar', payload)

    if (idx >= 0 && idx < procesosOrdenados.length - 1 && salidaTotal > 0) {
      const nextProc = procesosOrdenados[idx + 1]
      if (nextProc?.id) {
        const nextEntradaActual = Number(nextProc?.cantidad_entrada || 0)
        const deltaSalida = Number.isFinite(salidaInput) ? salidaInput : 0
        const nuevaEntrada = nextEntradaActual + deltaSalida
        if (String(nextProc.estado || '').toUpperCase() === 'PENDIENTE') {
          await handleAccionProceso(nextProc.id, 'iniciar')
        }
        await handleAccionProceso(nextProc.id, 'completar', {
          cantidad_entrada: nuevaEntrada,
          cantidad_salida: Number(nextProc?.cantidad_salida || 0),
          parcial: true,
        })
      }
    }

    setCompletarInputs((prev) => ({
      ...prev,
      [proc.id]: { ...prev[proc.id], cantidad_salida: '', cantidad_perdida: '' },
    }))
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, px: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Producción
          </Typography>
          <Button variant="contained" onClick={handleOpenCrearOrden}>
            Crear orden
          </Button>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Órdenes de producción
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={cargarOrdenes}
              disabled={loadingOrdenes}
            >
              Recargar
            </Button>
          </Stack>

          {errorOrdenes && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorOrdenes}
            </Alert>
          )}

          {ordenes.filter((orden) => orden?.estado !== 'COMPLETADA').length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay órdenes de producción.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {ordenes
                .filter((orden) => orden?.estado !== 'COMPLETADA')
                .map((orden) => {
                const procesosOrdenados = ordenarProcesos(orden?.procesos || [])
                const producto =
                  orden?.producto ||
                  productosById[String(orden?.producto_id ?? orden?.productoId ?? '')]
                const productoNombre = getProductoNombre({ ...orden, producto })
                return (
                  <Paper key={orden.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Orden {orden.codigo ?? '—'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Producto: {productoNombre}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleSelectOrden(orden)}
                        >
                          Ver detalle
                        </Button>
                        {canDeleteOrden && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleEliminarOrden(orden.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </Stack>
                    </Stack>

                    {procesosOrdenados.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Esta orden no tiene procesos.
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell />
                              {procesosOrdenados.map((proc) => (
                                <TableCell key={proc.id} align="center">
                                  {getProcesoNombre(proc, procesosById)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Estado</TableCell>
                              {procesosOrdenados.map((proc) => (
                                <TableCell key={proc.id} align="center">
                                  {proc.estado ?? '—'}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              <TableCell>Cant. entrada</TableCell>
                              {procesosOrdenados.map((proc) => (
                                <TableCell key={proc.id} align="center">
                                  {proc.cantidad_entrada ?? '—'}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              <TableCell>Cant. salida</TableCell>
                              {procesosOrdenados.map((proc) => (
                                <TableCell key={proc.id} align="center">
                                  {proc.cantidad_salida ?? '—'}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              <TableCell>Cant. perdida</TableCell>
                              {procesosOrdenados.map((proc) => (
                                <TableCell key={proc.id} align="center">
                                  {proc.cantidad_perdida ?? '—'}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Dialog open={openDetalle} onClose={handleCloseDetalle} fullWidth maxWidth="lg">
          <DialogTitle>Detalle de orden</DialogTitle>
          <DialogContent dividers>
            {!selectedOrdenId ? (
              <Typography variant="body2" color="text.secondary">
                Selecciona una orden para ver sus procesos.
              </Typography>
            ) : loadingDetalle ? (
              <Typography variant="body2" color="text.secondary">
                Cargando detalle...
              </Typography>
            ) : (
              <>
                {(() => {
                  const producto =
                    detalleOrden?.producto ||
                    productosById[String(detalleOrden?.producto_id ?? detalleOrden?.productoId ?? '')]
                  const productoNombre = getProductoNombre({ ...detalleOrden, producto })
                  return (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        Código: {detalleOrden?.codigo ?? '—'}
                      </Typography>
                      <Typography variant="subtitle2">
                        Estado: {detalleOrden?.estado ?? '—'}
                      </Typography>
                      <Typography variant="subtitle2">
                        Producto: {productoNombre}
                      </Typography>
                      <Typography variant="subtitle2">
                        Cantidad planeada: {detalleOrden?.cantidad_planeada ?? '—'}
                      </Typography>
                    </Stack>
                  )
                })()}

                <Divider sx={{ mb: 2 }} />

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Orden</TableCell>
                        <TableCell>Proceso</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Cant. entrada</TableCell>
                        <TableCell>Cant. salida</TableCell>
                        <TableCell>Cant. perdida</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(detalleOrden?.procesos || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <Typography variant="body2" color="text.secondary">
                              No hay procesos para esta orden.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        detalleOrden?.procesos?.map((proc) => {
                          const inputs = completarInputs[proc.id] || {
                            cantidad_entrada: '',
                            cantidad_salida: '',
                            cantidad_perdida: '',
                          }
                          const procesosOrdenados = ordenarProcesos(detalleOrden?.procesos || [])
                          const idx = procesosOrdenados.findIndex((p) => p.id === proc.id)
                          const prevProc = idx > 0 ? procesosOrdenados[idx - 1] : null
                          const entradaAuto =
                            Number(proc.cantidad_entrada) ||
                            (idx === 0
                              ? Number(detalleOrden?.cantidad_planeada || 0)
                              : Number(prevProc?.cantidad_salida || 0))
                          return (
                            <TableRow key={proc.id}>
                              <TableCell>{proc.orden ?? '—'}</TableCell>
                              <TableCell>{getProcesoNombre(proc, procesosById)}</TableCell>
                              <TableCell>{proc.estado ?? '—'}</TableCell>
                              <TableCell sx={{ width: 140 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={Number.isFinite(entradaAuto) && entradaAuto > 0 ? entradaAuto : ''}
                                  disabled
                                  inputProps={{ min: 0 }}
                                />
                              </TableCell>
                              <TableCell sx={{ width: 140 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={inputs.cantidad_salida}
                                  onChange={(e) =>
                                    setCompletarInputs((prev) => ({
                                      ...prev,
                                      [proc.id]: {
                                        ...inputs,
                                        cantidad_salida: e.target.value,
                                      },
                                    }))
                                  }
                                  inputProps={{ min: 0 }}
                                />
                              </TableCell>
                              <TableCell sx={{ width: 140 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={inputs.cantidad_perdida}
                                  onChange={(e) =>
                                    setCompletarInputs((prev) => ({
                                      ...prev,
                                      [proc.id]: {
                                        ...inputs,
                                        cantidad_perdida: e.target.value,
                                      },
                                    }))
                                  }
                                  inputProps={{ min: 0 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleActualizarProceso(proc)}
                                >
                                  Actualizar
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            {selectedOrdenId && (
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => cargarDetalleOrden(selectedOrdenId)}
                disabled={loadingDetalle}
              >
                Recargar
              </Button>
            )}
            <Button onClick={handleCloseDetalle}>Cerrar</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openCrearOrden} onClose={handleCloseCrearOrden} fullWidth maxWidth="sm">
          <DialogTitle>Crear orden de producción</DialogTitle>
          <DialogContent dividers>
            <form id="crear-orden-form" onSubmit={handleCrearOrden}>
              <Stack spacing={2}>
                <TextField
                  label="Código"
                  value={form.codigo}
                  onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
                  required
                />
                <TextField
                  select
                  label="Producto"
                  value={form.productoId}
                  onChange={(e) => setForm((p) => ({ ...p, productoId: e.target.value }))}
                  required
                >
                  {productos.map((prod) => (
                    <MenuItem key={prod.id} value={prod.id}>
                      {prod.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Cantidad planeada"
                  type="number"
                  value={form.cantidadPlaneada}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cantidadPlaneada: e.target.value }))
                  }
                  required
                  inputProps={{ min: 0 }}
                />
                <TextField
                  select
                  label="Prioridad"
                  value={form.prioridad}
                  onChange={(e) => setForm((p) => ({ ...p, prioridad: e.target.value }))}
                >
                  {PRIORIDADES.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Notas"
                  multiline
                  minRows={2}
                  value={form.notas}
                  onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                />
                <Alert severity="info">
                  El producto debe tener ruta de procesos y BOM/Componentes para crear la orden.
                </Alert>
              </Stack>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCrearOrden}>Cancelar</Button>
            <Button variant="contained" type="submit" form="crear-orden-form">
              Crear orden
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
