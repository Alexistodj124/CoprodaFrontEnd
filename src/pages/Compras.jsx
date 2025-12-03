import * as React from 'react'
import {
  Box, Typography, TextField, Button, Stack, MenuItem,
  Paper, InputAdornment, Snackbar, Alert, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, IconButton
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import AddIcon from '@mui/icons-material/Add'

import { API_BASE_URL } from '../config/api'

export default function NuevaCompra() {
  const [producto, setProducto] = React.useState({
    sku: '',
    categoriaId: '',
    descripcion: '',
    precioCF: 0,
    precioMinorista: 0,
    precioMayorista: 0,
    imagen: '',
  })



  const [preview, setPreview] = React.useState('')
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })
  const [openNuevaCat, setOpenNuevaCat] = React.useState(false)
  const [nuevaCatNombre, setNuevaCatNombre] = React.useState('')
  const [nuevaCatDescripcion, setNuevaCatDescripcion] = React.useState('')
  const [categoriasProductos, setCategoriasProductos] = React.useState([])

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
      const res = await fetch(`${API_BASE_URL}/categorias-productos`)
      if (!res.ok) throw new Error('Error al obtener categorías de productos')
      const data = await res.json()
      // data viene como array de objetos { id, nombre, descripcion, activo }
      setCategoriasProductos(data)
    } catch (err) {
      console.error(err)
    }
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
      const res = await fetch(`${API_BASE_URL}/categorias-productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, descripcion }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Error creando categoría de producto:', errText)
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        setProducto((prev) => ({ ...prev, imagen: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }


  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMensajeExito('')

    try {
      const body = {
        sku: producto.sku || null,
        categoria_id: producto.categoriaId ? Number(producto.categoriaId) : null,
        descripcion: producto.descripcion,
        precio_cf: Number(producto.precioCF) || 0,
        precio_minorista: Number(producto.precioMinorista) || 0,
        precio_mayorista: Number(producto.precioMayorista) || 0,
        imagen: producto.imagen || null,
      }


      const res = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Error backend:', errText)
        throw new Error('Error al crear producto')
      }

      const data = await res.json()
      console.log('Producto creado:', data)

      // 🔹 limpiar formulario
      const initialProducto = {
        sku: '',
        categoriaId: '',
        descripcion: '',
        precioCF: 0,
        precioMinorista: 0,
        precioMayorista: 0,
        imagen: '',
      }
      setProducto(initialProducto)

      setPreview('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 🔹 cerrar dialog
      // 🔹 mostrar mensaje de éxito (puede ser snackbar o algo simple)
      setMensajeExito('Producto creado exitosamente')
      setOpenSnackbarExito(true)

    } catch (err) {
      console.error(err)
      alert('Ocurrió un error al guardar. Revisa consola.') // o snackbar de error
    } finally {
      setLoading(false)
    }
  }


  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Agregar nuevo producto
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Imagen */}
            <Box sx={{ textAlign: 'center' }}>
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
            </Box>

            {/* SKU / Código de barras */}
            <TextField
              label="SKU / Código de barras"
              fullWidth
              value={producto.sku}
              onChange={(e) =>
                setProducto((p) => ({ ...p, sku: e.target.value }))
              }
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              multiline
              minRows={3}
              fullWidth
              value={producto.descripcion}
              onChange={(e) =>
                setProducto((p) => ({ ...p, descripcion: e.target.value }))
              }
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

            <Button variant="contained" color="primary" type="submit">
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
