import * as React from 'react'
import {
  Box, Typography, TextField, Button, Stack, MenuItem,
  Paper, InputAdornment, Snackbar, Alert, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
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



  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })
  const [openNuevaCat, setOpenNuevaCat] = React.useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = React.useState('')
  const [nuevaCatDescripcion, setNuevaCatDescripcion] = React.useState('')
  const [categoriasProductos, setCategoriasProductos] = React.useState([])
  const isEditMode = productoId != null

  const [loading, setLoading] = React.useState(false)
  const [mensajeExito, setMensajeExito] = React.useState('')
  const [openSnackbarExito, setOpenSnackbarExito] = React.useState(false)



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

  React.useEffect(() => {
    cargarCategoriasProductos()
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
  }, [location.state])


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
