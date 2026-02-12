import * as React from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import AddIcon from '@mui/icons-material/Add'
import { useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const initialProducto = {
  nombre: '',
  codigo: '',
  categoriaId: '',
  precioCF: 0,
  precioMinorista: 0,
  precioMayorista: 0,
  foto: '',
  activo: true,
  esProductoFinal: true,
  stock: 0,
}

const initialComponenteForm = {
  nombre: '',
  codigo: '',
  categoriaId: '',
}

export default function ProduccionProcesos() {
  const location = useLocation()
  const [productoId, setProductoId] = React.useState('')
  const [producto, setProducto] = React.useState(initialProducto)

  const [productosDisponibles, setProductosDisponibles] = React.useState([])
  const [procesosDisponibles, setProcesosDisponibles] = React.useState([])
  const [materiasPrimasDisponibles, setMateriasPrimasDisponibles] = React.useState([])
  const [categoriasProductos, setCategoriasProductos] = React.useState([])

  const [procesoSeleccionado, setProcesoSeleccionado] = React.useState('')
  const [procesosRuta, setProcesosRuta] = React.useState([])
  const [bomItems, setBomItems] = React.useState([])
  const [componentesItems, setComponentesItems] = React.useState([])

  const [loading, setLoading] = React.useState(false)
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })
  const [openComponenteDialog, setOpenComponenteDialog] = React.useState(false)
  const [componenteForm, setComponenteForm] = React.useState(initialComponenteForm)
  const [savingComponente, setSavingComponente] = React.useState(false)
  const [openNuevaCat, setOpenNuevaCat] = React.useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = React.useState('')
  const [nuevaCatDescripcion, setNuevaCatDescripcion] = React.useState('')

  const tipo = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tipo')
  }, [location.search])
  const isComponente = tipo === 'componente'

  const productosFiltrados = React.useMemo(() => {
    if (tipo === 'producto') return productosDisponibles.filter((p) => p?.es_producto_final)
    if (tipo === 'componente') return productosDisponibles.filter((p) => p?.es_producto_final === false)
    return productosDisponibles
  }, [productosDisponibles, tipo])

  const procesosRutaOpciones = React.useMemo(() => {
    return procesosRuta
      .map((item) => {
        const procesoInfo = procesosDisponibles.find(
          (p) => String(p.id) === String(item.proceso_id)
        )
        if (!item?.proceso_id) return null
        return {
          id: item.proceso_id,
          nombre: procesoInfo?.nombre || 'Proceso',
          orden: item.orden,
        }
      })
      .filter(Boolean)
  }, [procesosRuta, procesosDisponibles])

  const aplicarProductoEnFormulario = (data) => {
    if (!data) return
    setProducto((prev) => ({
      ...prev,
      nombre: data.nombre ?? data.descripcion ?? '',
      codigo: data.codigo ?? '',
      categoriaId: data.categoria_id ?? data.categoriaId ?? '',
      precioCF: data.precio_cf ?? data.precioCF ?? 0,
      precioMinorista: data.precio_minorista ?? data.precioMinorista ?? 0,
      precioMayorista: data.precio_mayorista ?? data.precioMayorista ?? 0,
      foto: data.foto ?? '',
      activo: data.activo ?? true,
      esProductoFinal: data.es_producto_final ?? data.esProductoFinal ?? true,
      stock: data.stock ?? 0,
    }))
  }

  const cargarProcesos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/procesos`)
      if (!res.ok) throw new Error('Error al obtener procesos')
      const data = await res.json()
      setProcesosDisponibles(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarMateriasPrimas = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/materias-primas`)
      if (!res.ok) throw new Error('Error al obtener materias primas')
      const data = await res.json()
      setMateriasPrimasDisponibles(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarCategoriasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias_producto`)
      if (!res.ok) throw new Error('Error al obtener categorías de productos')
      const data = await res.json()
      setCategoriasProductos(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarProductosDisponibles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      setProductosDisponibles(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarProductoDetalle = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}`)
      if (!res.ok) throw new Error('Error al obtener producto')
      const data = await res.json()
      return data
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const cargarRutaProcesosProducto = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}/ruta-procesos`)
      if (!res.ok) throw new Error('Error al obtener ruta de procesos')
      const data = await res.json()
      setProcesosRuta(
        (data || []).map((item) => ({
          proceso_id: item.proceso_id ?? item.procesoId ?? item.proceso?.id ?? '',
          orden: item.orden ?? item.order ?? '',
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const cargarBomProducto = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}/bom`)
      if (!res.ok) throw new Error('Error al obtener BOM')
      const data = await res.json()
      setBomItems(
        (data || []).map((item) => ({
          materia_prima_id: item.materia_prima_id ?? item.materiaPrimaId ?? item.materia_prima?.id ?? '',
          cantidad_necesaria: item.cantidad_necesaria ?? item.cantidad ?? 0,
          proceso_id: item.proceso_id ?? item.procesoId ?? '',
          notas: item.notas ?? '',
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const cargarComponentesProducto = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos/${id}/componentes`)
      if (!res.ok) throw new Error('Error al obtener componentes')
      const data = await res.json()
      setComponentesItems(
        (data || []).map((item) => ({
          componente_id: item.componente_id ?? item.componenteId ?? item.componente?.id ?? '',
          cantidad_necesaria: item.cantidad_necesaria ?? item.cantidad ?? 0,
          proceso_id: item.proceso_id ?? item.procesoId ?? '',
          notas: item.notas ?? '',
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const resetDetalle = () => {
    setProducto(initialProducto)
    setProcesoSeleccionado('')
    setProcesosRuta([])
    setBomItems([])
    setComponentesItems([])
  }

  const resetComponenteForm = () => {
    setComponenteForm(initialComponenteForm)
  }

  const handleOpenNuevaCat = () => {
    setNuevaCatNombre('')
    setNuevaCatDescripcion('')
    setOpenNuevaCat(true)
  }

  const handleCloseNuevaCat = () => {
    setOpenNuevaCat(false)
  }

  const handleGuardarNuevaCat = async () => {
    const nombre = nuevaCatNombre.trim()
    const descripcion = nuevaCatDescripcion.trim() || null
    if (!nombre) return

    try {
      const res = await fetch(`${API_BASE_URL}/categorias_producto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion }),
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = 'Error creando categoría de producto'
        try {
          const parsed = JSON.parse(errText)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      const created = await res.json()
      await cargarCategoriasProductos()
      if (created?.id) {
        setComponenteForm((prev) => ({ ...prev, categoriaId: created.id }))
      }
      setOpenNuevaCat(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectProducto = async (nextId) => {
    setProductoId(nextId)
    if (!nextId) {
      resetDetalle()
      return
    }

    const detalle = await cargarProductoDetalle(nextId)
    if (detalle) aplicarProductoEnFormulario(detalle)
    cargarRutaProcesosProducto(nextId)
    cargarBomProducto(nextId)
    if (!isComponente) {
      cargarComponentesProducto(nextId)
    }
  }

  const handleGuardarComponente = async () => {
    const nombre = componenteForm.nombre.trim()
    const codigo = componenteForm.codigo.trim()
    if (!nombre || !codigo || !componenteForm.categoriaId) {
      setSnack({
        open: true,
        msg: 'Nombre, código y categoría son requeridos',
        severity: 'error',
      })
      return
    }

    setSavingComponente(true)
    try {
      const body = {
        nombre,
        codigo,
        categoria_id: Number(componenteForm.categoriaId),
        precio_cf: 0,
        precio_minorista: 0,
        precio_mayorista: 0,
        foto: null,
        activo: true,
        es_producto_final: false,
        stock: 0,
      }

      const res = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = 'Error al crear componente'
        try {
          const parsed = JSON.parse(errText)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      const data = await res.json()
      const savedId = data?.id
      await cargarProductosDisponibles()
      if (savedId != null) {
        await handleSelectProducto(String(savedId))
      }
      setSnack({ open: true, msg: 'Componente creado', severity: 'success' })
      setOpenComponenteDialog(false)
      resetComponenteForm()
    } catch (error) {
      console.error(error)
      setSnack({ open: true, msg: 'Error al crear componente', severity: 'error' })
    } finally {
      setSavingComponente(false)
    }
  }

  const handleCloseComponenteDialog = () => {
    setOpenComponenteDialog(false)
    resetComponenteForm()
  }

  const handleGuardar = async (event) => {
    event.preventDefault()
    if (!productoId) {
      setSnack({ open: true, msg: 'Selecciona un producto primero', severity: 'error' })
      return
    }

    setLoading(true)
    try {
      const body = {
        nombre: producto.nombre,
        codigo: producto.codigo,
        categoria_id: producto.categoriaId ? Number(producto.categoriaId) : null,
        precio_cf: Number(producto.precioCF) || 0,
        precio_minorista: Number(producto.precioMinorista) || 0,
        precio_mayorista: Number(producto.precioMayorista) || 0,
        foto: producto.foto || null,
        activo: Boolean(producto.activo),
        es_producto_final: Boolean(producto.esProductoFinal),
        stock: Number(producto.stock) || 0,
      }

      const res = await fetch(`${API_BASE_URL}/productos/${productoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = 'Error al actualizar producto'
        try {
          const parsed = JSON.parse(errText)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        throw new Error(msg)
      }

      const data = await res.json()
      const savedProductoId = data?.id ?? productoId

      if (savedProductoId != null) {
        for (let i = 0; i < procesosRuta.length; i += 1) {
          const proceso = procesosRuta[i]
          if (!proceso?.proceso_id) continue
          await fetch(`${API_BASE_URL}/productos/${savedProductoId}/ruta-procesos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              proceso_id: Number(proceso.proceso_id),
              orden: Number(proceso.orden ?? i + 1),
            }),
          })
        }

        for (const item of bomItems) {
          if (!item?.materia_prima_id) continue
          await fetch(`${API_BASE_URL}/productos/${savedProductoId}/bom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              materia_prima_id: Number(item.materia_prima_id),
              cantidad_necesaria: Number(item.cantidad_necesaria) || 0,
              proceso_id: item.proceso_id ? Number(item.proceso_id) : null,
              notas: item.notas || null,
            }),
          })
        }

        if (!isComponente) {
          for (const item of componentesItems) {
            if (!item?.componente_id) continue
            await fetch(`${API_BASE_URL}/productos/${savedProductoId}/componentes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                componente_id: Number(item.componente_id),
                cantidad_necesaria: Number(item.cantidad_necesaria) || 0,
                proceso_id: item.proceso_id ? Number(item.proceso_id) : null,
                notas: item.notas || null,
              }),
            })
          }
        }
      }

      setSnack({ open: true, msg: 'Configuración guardada', severity: 'success' })
    } catch (err) {
      console.error(err)
      setSnack((prev) =>
        prev.open
          ? prev
          : { open: true, msg: 'Error al guardar la configuración', severity: 'error' }
      )
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    cargarProcesos()
    cargarMateriasPrimas()
    cargarProductosDisponibles()
    cargarCategoriasProductos()
  }, [])

  React.useEffect(() => {
    setProductoId('')
    resetDetalle()
    setOpenComponenteDialog(false)
    resetComponenteForm()
  }, [tipo])

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 3, px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {tipo === 'componente' ? 'Procesos de componentes' : 'Procesos de productos'}
          </Typography>
          {isComponente ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenComponenteDialog(true)}
            >
              Agregar componente
            </Button>
          ) : null}
        </Stack>

        <form onSubmit={handleGuardar}>
          <Stack spacing={2}>
            <TextField
              select
              label={tipo === 'componente' ? 'Componente' : 'Producto'}
              fullWidth
              value={productoId}
              onChange={(e) => handleSelectProducto(e.target.value)}
            >
              {productosFiltrados.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.codigo ? `${prod.codigo} - ` : ''}{prod.nombre}
                </MenuItem>
              ))}
            </TextField>

            {productoId ? (
              <Typography variant="body2" color="text.secondary">
                {producto.codigo ? `Código: ${producto.codigo} · ` : ''}{producto.nombre}
              </Typography>
            ) : null}

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Ruta de procesos
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                select
                label="Seleccionar proceso"
                fullWidth
                value={procesoSeleccionado}
                onChange={(e) => setProcesoSeleccionado(e.target.value)}
              >
                {procesosDisponibles.map((proc) => (
                  <MenuItem key={proc.id} value={proc.id}>
                    {proc.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                onClick={() => {
                  if (!procesoSeleccionado) return
                  setProcesosRuta((prev) => [
                    ...prev,
                    {
                      proceso_id: procesoSeleccionado,
                      orden: prev.length + 1,
                    },
                  ])
                  setProcesoSeleccionado('')
                }}
              >
                Agregar proceso
              </Button>
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Orden</TableCell>
                    <TableCell>Proceso</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procesosRuta.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          Aún no hay procesos agregados.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    procesosRuta.map((item, index) => {
                      const procesoInfo = procesosDisponibles.find(
                        (p) => String(p.id) === String(item.proceso_id)
                      )
                      return (
                        <TableRow key={`${item.proceso_id}-${index}`}>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.orden ?? index + 1}
                              onChange={(e) => {
                                const value = Number(e.target.value)
                                setProcesosRuta((prev) =>
                                  prev.map((p, i) =>
                                    i === index ? { ...p, orden: value } : p
                                  )
                                )
                              }}
                              inputProps={{ min: 1, style: { width: 70 } }}
                            />
                          </TableCell>
                          <TableCell>{procesoInfo?.nombre || 'Proceso'}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (index === 0) return
                                setProcesosRuta((prev) => {
                                  const next = [...prev]
                                  const temp = next[index - 1]
                                  next[index - 1] = next[index]
                                  next[index] = temp
                                  return next
                                })
                              }}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (index === procesosRuta.length - 1) return
                                setProcesosRuta((prev) => {
                                  const next = [...prev]
                                  const temp = next[index + 1]
                                  next[index + 1] = next[index]
                                  next[index] = temp
                                  return next
                                })
                              }}
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setProcesosRuta((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Materias primas
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '30%' }}>Materia prima</TableCell>
                    <TableCell sx={{ width: 140 }}>Cantidad</TableCell>
                    <TableCell sx={{ width: '30%' }}>Proceso</TableCell>
                    <TableCell>Notas</TableCell>
                    <TableCell align="right" sx={{ width: 90 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bomItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          Aún no hay materias primas agregadas.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bomItems.map((item, index) => (
                      <TableRow key={`bom-${index}`}>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={item.materia_prima_id}
                            onChange={(e) => {
                              const value = e.target.value
                              setBomItems((prev) =>
                                prev.map((p, i) =>
                                  i === index ? { ...p, materia_prima_id: value } : p
                                )
                              )
                            }}
                          >
                            {materiasPrimasDisponibles.map((mp) => (
                              <MenuItem key={mp.id} value={mp.id}>
                                {mp.nombre}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.cantidad_necesaria}
                            onChange={(e) => {
                              const value = e.target.value
                              setBomItems((prev) =>
                                prev.map((p, i) =>
                                  i === index
                                    ? { ...p, cantidad_necesaria: value }
                                    : p
                                )
                              )
                            }}
                            inputProps={{ min: 0, style: { width: 90 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={item.proceso_id || ''}
                            onChange={(e) => {
                              const value = e.target.value
                              setBomItems((prev) =>
                                prev.map((p, i) =>
                                  i === index ? { ...p, proceso_id: value } : p
                                )
                              )
                            }}
                          >
                            {procesosRutaOpciones.map((proc) => (
                              <MenuItem key={proc.id} value={proc.id}>
                                {proc.orden != null ? `${proc.orden}. ` : ''}
                                {proc.nombre}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={item.notas}
                            onChange={(e) => {
                              const value = e.target.value
                              setBomItems((prev) =>
                                prev.map((p, i) =>
                                  i === index ? { ...p, notas: value } : p
                                )
                              )
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setBomItems((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="outlined"
              onClick={() =>
                setBomItems((prev) => [
                  ...prev,
                  {
                    materia_prima_id: '',
                    cantidad_necesaria: 1,
                    proceso_id: '',
                    notas: '',
                  },
                ])
              }
            >
              Agregar MP
            </Button>

            {!isComponente ? (
              <>
                <Divider />

                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Componentes (sub-ensambles)
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '30%' }}>Producto componente</TableCell>
                        <TableCell sx={{ width: 140 }}>Cantidad</TableCell>
                        <TableCell sx={{ width: '30%' }}>Proceso</TableCell>
                        <TableCell>Notas</TableCell>
                        <TableCell align="right" sx={{ width: 90 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {componentesItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Typography variant="body2" color="text.secondary">
                              Aún no hay componentes agregados.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        componentesItems.map((item, index) => (
                          <TableRow key={`comp-${index}`}>
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                fullWidth
                                value={item.componente_id}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setComponentesItems((prev) =>
                                    prev.map((p, i) =>
                                      i === index ? { ...p, componente_id: value } : p
                                    )
                                  )
                                }}
                              >
                                {productosDisponibles.map((prod) => (
                                  <MenuItem key={prod.id} value={prod.id}>
                                    {prod.nombre}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={item.cantidad_necesaria}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setComponentesItems((prev) =>
                                    prev.map((p, i) =>
                                      i === index
                                        ? { ...p, cantidad_necesaria: value }
                                        : p
                                    )
                                  )
                                }}
                                inputProps={{ min: 0, style: { width: 90 } }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                select
                                size="small"
                                fullWidth
                                value={item.proceso_id || ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setComponentesItems((prev) =>
                                    prev.map((p, i) =>
                                      i === index ? { ...p, proceso_id: value } : p
                                    )
                                  )
                                }}
                              >
                                {procesosRutaOpciones.map((proc) => (
                                  <MenuItem key={proc.id} value={proc.id}>
                                    {proc.orden != null ? `${proc.orden}. ` : ''}
                                    {proc.nombre}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                value={item.notas}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setComponentesItems((prev) =>
                                    prev.map((p, i) =>
                                      i === index ? { ...p, notas: value } : p
                                    )
                                  )
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setComponentesItems((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  )
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Button
                  variant="outlined"
                  onClick={() =>
                    setComponentesItems((prev) => [
                      ...prev,
                      {
                        componente_id: '',
                        cantidad_necesaria: 1,
                        proceso_id: '',
                        notas: '',
                      },
                    ])
                  }
                >
                  Agregar componente
                </Button>
              </>
            ) : null}

            <Button variant="contained" color="primary" type="submit" disabled={loading || !productoId}>
              Guardar configuración
            </Button>
          </Stack>
        </form>
      </Paper>

      <Dialog open={openComponenteDialog} onClose={handleCloseComponenteDialog} fullWidth maxWidth="sm">
        <DialogTitle>Agregar componente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del componente"
              fullWidth
              value={componenteForm.nombre}
              onChange={(e) => setComponenteForm((p) => ({ ...p, nombre: e.target.value }))}
              autoFocus
              required
            />
            <TextField
              label="Código / SKU"
              fullWidth
              value={componenteForm.codigo}
              onChange={(e) => setComponenteForm((p) => ({ ...p, codigo: e.target.value }))}
              required
            />
            <Box display="flex" gap={1}>
              <TextField
                select
                label="Categoría"
                fullWidth
                value={componenteForm.categoriaId}
                onChange={(e) => setComponenteForm((p) => ({ ...p, categoriaId: e.target.value }))}
              >
                {categoriasProductos.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton
                color="primary"
                aria-label="Agregar categoría"
                onClick={handleOpenNuevaCat}
                sx={{ flexShrink: 0, alignSelf: 'center' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComponenteDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarComponente} disabled={savingComponente}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNuevaCat} onClose={handleCloseNuevaCat} fullWidth maxWidth="sm">
        <DialogTitle>Nueva categoría de producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nombre de la categoría"
            value={nuevaCatNombre}
            onChange={(e) => setNuevaCatNombre(e.target.value)}
            autoFocus
            required
          />
          <TextField
            label="Descripción (opcional)"
            value={nuevaCatDescripcion}
            onChange={(e) => setNuevaCatDescripcion(e.target.value)}
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNuevaCat}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarNuevaCat}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
