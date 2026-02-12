import * as React from 'react'
import {
  Box, Typography, TextField, Button, Stack, MenuItem,
  Paper, InputAdornment, Snackbar, Alert, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, IconButton, Divider, Checkbox, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { useLocation } from 'react-router-dom'

import { API_BASE_URL } from '../config/api'

export default function NuevaCompra() {
  const location = useLocation()
  const [productoId, setProductoId] = React.useState(null)
  const [producto, setProducto] = React.useState({
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
  })



  const [preview, setPreview] = React.useState('')
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })
  const [openNuevaCat, setOpenNuevaCat] = React.useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = React.useState('')
  const [nuevaCatDescripcion, setNuevaCatDescripcion] = React.useState('')
  const [categoriasProductos, setCategoriasProductos] = React.useState([])
  const [procesosDisponibles, setProcesosDisponibles] = React.useState([])
  const [materiasPrimasDisponibles, setMateriasPrimasDisponibles] = React.useState([])
  const [productosDisponibles, setProductosDisponibles] = React.useState([])

  const [procesoSeleccionado, setProcesoSeleccionado] = React.useState('')
  const [procesosRuta, setProcesosRuta] = React.useState([])
  const [bomItems, setBomItems] = React.useState([])
  const [componentesItems, setComponentesItems] = React.useState([])

  const [openNuevoProceso, setOpenNuevoProceso] = React.useState(false)
  const [nuevoProcesoNombre, setNuevoProcesoNombre] = React.useState('')
  const [nuevoProcesoDescripcion, setNuevoProcesoDescripcion] = React.useState('')
  const [openNuevaMP, setOpenNuevaMP] = React.useState(false)
  const [nuevaMPNombre, setNuevaMPNombre] = React.useState('')
  const [nuevaMPCodigo, setNuevaMPCodigo] = React.useState('')
  const isEditMode = productoId != null

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

  const [loading, setLoading] = React.useState(false)
  const [mensajeExito, setMensajeExito] = React.useState('')
  const [openSnackbarExito, setOpenSnackbarExito] = React.useState(false)
  const fileInputRef = React.useRef(null)



  const handleCloseSnackbarExito = (_, reason) => {
    if (reason === 'clickaway') return
    setOpenSnackbarExito(false)
  }

  const cargarCategoriasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias_producto`)
      if (!res.ok) throw new Error('Error al obtener categorías de productos')
      const data = await res.json()
      // data viene como array de objetos { id, nombre, descripcion, creada_en, actualizada_en }
      setCategoriasProductos(data)
    } catch (err) {
      console.error(err)
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
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

      const created = await res.json() // { id, nombre, ... }

      // 🔁 Refrescar categorías desde el backend
      await cargarCategoriasProductos()

      // Seleccionar automáticamente la nueva categoría en el producto
      if (created?.id) {
        setProducto((p) => ({ ...p, categoriaId: created.id }))
      }

      setOpenNuevaCat(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleOpenNuevoProceso = () => {
    setNuevoProcesoNombre('')
    setNuevoProcesoDescripcion('')
    setOpenNuevoProceso(true)
  }

  const handleCloseNuevoProceso = () => {
    setOpenNuevoProceso(false)
  }

  const handleGuardarNuevoProceso = async () => {
    const nombre = nuevoProcesoNombre.trim()
    const descripcion = nuevoProcesoDescripcion.trim() || null
    if (!nombre) return

    try {
      const res = await fetch(`${API_BASE_URL}/procesos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion }),
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = 'Error creando proceso'
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
      await cargarProcesos()
      if (created?.id) {
        setProcesoSeleccionado(created.id)
      }
      setOpenNuevoProceso(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleOpenNuevaMP = () => {
    setNuevaMPNombre('')
    setNuevaMPCodigo('')
    setOpenNuevaMP(true)
  }

  const handleCloseNuevaMP = () => {
    setOpenNuevaMP(false)
  }

  const handleGuardarNuevaMP = async () => {
    const nombre = nuevaMPNombre.trim()
    const codigo = nuevaMPCodigo.trim()
    if (!nombre || !codigo) return

    try {
      const res = await fetch(`${API_BASE_URL}/materias-primas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, codigo }),
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = 'Error creando materia prima'
        try {
          const parsed = JSON.parse(errText)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      await res.json()
      await cargarMateriasPrimas()
      setOpenNuevaMP(false)
      setSnack({ open: true, msg: 'Materia prima creada', severity: 'success' })
    } catch (error) {
      console.error(error)
    }
  }

  React.useEffect(() => {
    cargarCategoriasProductos()
    cargarProcesos()
    cargarMateriasPrimas()
    cargarProductosDisponibles()
  }, [])

  React.useEffect(() => {
    const editId = location.state?.editProductoId ?? location.state?.producto?.id ?? null
    if (!editId) return

    setProductoId(editId)
    aplicarProductoEnFormulario(location.state?.producto || null)

    const cargarTodo = async () => {
      const detalle = await cargarProductoDetalle(editId)
      if (detalle) aplicarProductoEnFormulario(detalle)
    }
    cargarTodo()
    cargarRutaProcesosProducto(editId)
    cargarBomProducto(editId)
    cargarComponentesProducto(editId)
  }, [location.state])

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tipo = params.get('tipo')
    const editId = location.state?.editProductoId ?? location.state?.producto?.id ?? null
    if (editId) return

    if (tipo === 'componente') {
      setProducto((prev) => ({ ...prev, esProductoFinal: false }))
    }
    if (tipo === 'producto') {
      setProducto((prev) => ({ ...prev, esProductoFinal: true }))
    }
  }, [location.search, location.state])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        setProducto((prev) => ({ ...prev, foto: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }


  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMensajeExito('')

    try {
      const nombre = producto.nombre.trim()
      const codigo = producto.codigo.trim()
      if (!nombre || !codigo || !producto.categoriaId) {
        setSnack({
          open: true,
          msg: 'Nombre, código y categoría son requeridos',
          severity: 'error',
        })
        setLoading(false)
        return
      }

      const body = {
        nombre,
        codigo,
        categoria_id: producto.categoriaId ? Number(producto.categoriaId) : null,
        precio_cf: Number(producto.precioCF) || 0,
        precio_minorista: Number(producto.precioMinorista) || 0,
        precio_mayorista: Number(producto.precioMayorista) || 0,
        foto: producto.foto || null,
        activo: Boolean(producto.activo),
        es_producto_final: Boolean(producto.esProductoFinal),
        stock: Number(producto.stock) || 0,
      }


      const res = await fetch(
        `${API_BASE_URL}/productos${isEditMode ? `/${productoId}` : ''}`,
        {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = isEditMode ? 'Error al actualizar producto' : 'Error al crear producto'
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
      console.log(isEditMode ? 'Producto actualizado:' : 'Producto creado:', data)
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

      // 🔹 limpiar formulario
      if (!isEditMode) {
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
        setProducto(initialProducto)
        setProcesosRuta([])
        setBomItems([])
        setComponentesItems([])
        setProcesoSeleccionado('')
      }

      setPreview('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 🔹 cerrar dialog
      // 🔹 mostrar mensaje de éxito (puede ser snackbar o algo simple)
      setMensajeExito(isEditMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
      setOpenSnackbarExito(true)

    } catch (err) {
      console.error(err)
      alert('Ocurrió un error al guardar. Revisa consola.') // o snackbar de error
    } finally {
      setLoading(false)
    }
  }


  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 3, px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {isEditMode ? 'Editar producto' : 'Agregar nuevo producto'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Imagen */}
            {/* <Box sx={{ textAlign: 'center' }}>
              {preview ? (
                <Box
                  component="img"
                  src={preview}
                  alt="Vista previa"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 1,
                    border: '2px solid #444',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <AddPhotoAlternateIcon fontSize="large" color="action" />
                </Box>
              )}
              <Button variant="outlined" component="label">
                Subir imagen
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </Button>
            </Box> */}

            {/* Nombre */}
            <TextField
              label="Nombre del producto"
              fullWidth
              value={producto.nombre}
              onChange={(e) =>
                setProducto((p) => ({ ...p, nombre: e.target.value }))
              }
              required
            />

            {/* Código / SKU */}
            <TextField
              label="Código / SKU"
              fullWidth
              value={producto.codigo}
              onChange={(e) =>
                setProducto((p) => ({ ...p, codigo: e.target.value }))
              }
              required
            />

            {/* Categoría + botón agregar */}
            <Box display="flex" gap={1}>
              <TextField
                select
                label="Categoría"
                fullWidth
                value={producto.categoriaId}
                onChange={(e) =>
                  setProducto((p) => ({ ...p, categoriaId: e.target.value }))
                }
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

            {/* Precios */}
            <TextField
              label="Precio CF (Q)"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Q</InputAdornment>
                ),
              }}
              value={producto.precioCF}
              onChange={(e) =>
                setProducto((p) => ({ ...p, precioCF: e.target.value }))
              }
            />
            <TextField
              label="Precio Minorista (Q)"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Q</InputAdornment>
                ),
              }}
              value={producto.precioMinorista}
              onChange={(e) =>
                setProducto((p) => ({ ...p, precioMinorista: e.target.value }))
              }
            />
            <TextField
              label="Precio Mayorista (Q)"
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Q</InputAdornment>
                ),
              }}
              value={producto.precioMayorista}
              onChange={(e) =>
                setProducto((p) => ({ ...p, precioMayorista: e.target.value }))
              }
            />

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Datos básicos
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={producto.activo}
                    onChange={(e) =>
                      setProducto((p) => ({ ...p, activo: e.target.checked }))
                    }
                  />
                }
                label="Activo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={producto.esProductoFinal}
                    onChange={(e) =>
                      setProducto((p) => ({
                        ...p,
                        esProductoFinal: e.target.checked,
                      }))
                    }
                  />
                }
                label="Es producto final"
              />
            </Stack>

            <TextField
              label="Stock (si aplica)"
              type="number"
              value={producto.stock}
              onChange={(e) =>
                setProducto((p) => ({ ...p, stock: e.target.value }))
              }
            />

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
              <Button variant="text" onClick={handleOpenNuevoProceso}>
                Crear proceso nuevo
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

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Materias primas
              </Typography>
              <Button size="small" variant="text" onClick={handleOpenNuevaMP}>
                Crear nueva MP
              </Button>
            </Stack>

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

            <Button variant="contained" color="primary" type="submit" disabled={loading}>
              Guardar
            </Button>
          </Stack>
        </form>

        {/* Dialog nueva categoría */}
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

        <Dialog open={openNuevoProceso} onClose={handleCloseNuevoProceso} fullWidth maxWidth="sm">
          <DialogTitle>Nuevo proceso</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre del proceso"
              value={nuevoProcesoNombre}
              onChange={(e) => setNuevoProcesoNombre(e.target.value)}
              autoFocus
              required
            />
            <TextField
              label="Descripción (opcional)"
              value={nuevoProcesoDescripcion}
              onChange={(e) => setNuevoProcesoDescripcion(e.target.value)}
              multiline
              minRows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNuevoProceso}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarNuevoProceso}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openNuevaMP} onClose={handleCloseNuevaMP} fullWidth maxWidth="sm">
          <DialogTitle>Nueva materia prima</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código"
              value={nuevaMPCodigo}
              onChange={(e) => setNuevaMPCodigo(e.target.value)}
              required
            />
            <TextField
              label="Nombre de la materia prima"
              value={nuevaMPNombre}
              onChange={(e) => setNuevaMPNombre(e.target.value)}
              autoFocus
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNuevaMP}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardarNuevaMP}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>

      <Snackbar
        open={openSnackbarExito}
        autoHideDuration={3000}
        onClose={handleCloseSnackbarExito}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbarExito}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {mensajeExito}
        </Alert>
      </Snackbar>
    </Box>
  )

}
