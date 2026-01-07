// src/pages/Inventory.jsx
import * as React from 'react'
import {
  Box, Typography, Divider, List, ListItem, ListItemText,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Snackbar, Alert, MenuItem, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { API_BASE_URL } from '../config/api'


const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'autos', label: 'Cabello' },
  { id: 'motos', label: 'Uñas' },
  { id: 'quimicos', label: 'Pedicure' },
  { id: 'accesorios', label: 'Manicure' },
]

const PRODUCTS = [
  { id: 1, name: 'Shampoo pH Neutro 1L', sku: 'SH-001', price: 89.90, stock: 12, cat: 'quimicos', image: '' },
  { id: 2, name: 'Guante Microfibra Premium', sku: 'GM-010', price: 59.50, stock: 3,  cat: 'accesorios', image: '' },
  { id: 3, name: 'Cera Sintética 500ml', sku: 'CE-500', price: 129.00, stock: 7, cat: 'quimicos', image: '' },
  { id: 4, name: 'Toalla Secado 1200gsm', sku: 'TS-1200', price: 99.00, stock: 20, cat: 'accesorios', image: '' },
  { id: 5, name: 'Cepillo Llantas', sku: 'CL-020', price: 45.00, stock: 2, cat: 'accesorios', image: '' },
  { id: 6, name: 'Ambientador New Car', sku: 'AN-001', price: 25.00, stock: 14, cat: 'accesorios', image: '' },
]

const empleadas = [
  { id: 1, nombre: 'Ana' },
  { id: 2, nombre: 'María' },
  { id: 3, nombre: 'Lucía' },
]

const TIPO_PAGO_GRUPOS = [
  { id: 'credito', label: 'Crédito' },
  { id: 'contado', label: 'Contado' },
]

const tipoPOS = [
  { id: 'all', label: 'Todo' },
  { id: 'serv', label: 'Servicios' },
  { id: 'prod', label: 'Productos' },
]


export default function Inventory() {
  const DEFAULT_ESTADO_ID = 1
  const getPrecioForCliente = (product, clasificacion) => {
    if (!product) return 0
    const toNumber = (value) => {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    }

    switch ((clasificacion || '').toLowerCase()) {
      case 'cf':
        return toNumber(product.precio_cf ?? product.precio)
      case 'mayorista':
        return toNumber(product.precio_mayorista ?? product.precio)
      case 'minorista':
        return toNumber(product.precio_minorista ?? product.precio)
      default:
        return toNumber(
          product.precio_cf ??
          product.precio_minorista ??
          product.precio_mayorista ??
          product.precio
        )
    }
  }

  const [tipoPOSset, setTipoPOS] = React.useState('all')
  const [category, setCategory] = React.useState('all')
  const [cart, setCart] = React.useState([])
  const [qtyDialog, setQtyDialog] = React.useState({
    open: false,
    product: null,
    qty: 1,
    error: '',
  })

  // Dialog de datos del cliente
  const [openDialog, setOpenDialog] = React.useState(false)
  const [venta, setVenta] = React.useState({
    empleada: '',
    tipoPago: '',
    tipoPagoDetalle: '',
    referencia: '',
  })
  const [errors, setErrors] = React.useState({ nombre: '', telefono: '' })

  const [categoriasProductos, setCategoriasProductos] = React.useState([])
  const [categoriasServicios, setCategoriasServicios] = React.useState([])
  const [productos, setProductos] = React.useState([])
  const [empleadas, setEmpleadas] = React.useState([])
  const [tiposPago, setTiposPago] = React.useState([])

  const [clientes, setClientes] = React.useState([])          // lista desde el backend
  const [cliente, setCliente] = React.useState({ nombre: '', telefono: '', email: '', nit: '' })
  const [esClienteExistente, setEsClienteExistente] = React.useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState(null)
  const hasClienteSeleccionado = Boolean(
    clienteSeleccionado || (cliente.nombre && cliente.nombre.trim())
  )
  const clasificacionSeleccionada = clienteSeleccionado?.clasificacion_precio || ''

  const [categoria, setCategoria] = React.useState('')
  const [skuQuery, setSkuQuery] = React.useState('')
  
  const filterClientes = (options, { inputValue }) => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return options

    return options.filter((option) => {
      if (typeof option === 'string') {
        return option.toLowerCase().includes(query)
      }

      const nombre = (option.nombre ?? '').toLowerCase()
      const codigo = (option.codigo ?? '').toLowerCase()
      const id = option.id != null ? String(option.id).toLowerCase() : ''
      return nombre.includes(query) || codigo.includes(query) || id.includes(query)
    })
  }


  const getTipoPagoLabel = (detalle) => detalle?.nombre ?? detalle?.label ?? ''
  const pagoDetalleOpciones = React.useMemo(() => {
    const grupoSeleccionado = (venta.tipoPago || '').toLowerCase()
    if (!grupoSeleccionado) return []

    return tiposPago.filter((detalle) => {
      const grupo = String(
        detalle?.tipo ??
        detalle?.grupo ??
        detalle?.categoria ??
        detalle?.clase ??
        ''
      ).toLowerCase()
      const nombre = getTipoPagoLabel(detalle).toLowerCase()
      const descripcion = String(detalle?.descripcion ?? '').toLowerCase()
      return (
        grupo.includes(grupoSeleccionado) ||
        nombre.includes(grupoSeleccionado) ||
        descripcion.includes(grupoSeleccionado)
      )
    })
  }, [tiposPago, venta.tipoPago])
  const pagoDetalleSeleccionado = pagoDetalleOpciones.find(
    (opt) => String(opt.id) === String(venta.tipoPagoDetalle)
  )
  const requiereReferencia =
    getTipoPagoLabel(pagoDetalleSeleccionado).toLowerCase() === 'transferencia' ||
    getTipoPagoLabel(pagoDetalleSeleccionado).toLowerCase() === 'cheque'
    
  // Snackbar de confirmación
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })

  // const filtered = React.useMemo(() => {
  //   if (categoriasProductos.id === 'all') return productos
  //   return productos.filter(p => p.categoria_id === categoriasProductos.id)
  // }, [categoriasProductos.id])
  const productosConPrecio = React.useMemo(() => (
    productos.map((p) => ({
      ...p,
      descripcion: p.descripcion ?? p.nombre ?? '',
      precio: getPrecioForCliente(p, clasificacionSeleccionada),
    }))
  ), [productos, clasificacionSeleccionada])

  const filtered = React.useMemo(() => {
    const skuQ = skuQuery.trim().toLowerCase()

    return productosConPrecio.filter((p) => {
      // Categoría
      if (categoria && String(p.categoria_id) !== String(categoria.id)) {
        return false
      }

      // SKU (buscar por texto parcial)
      if (skuQ) {
        const sku = (p.sku || p.codigo || '').toLowerCase()
        if (!sku.includes(skuQ)) {
          return false
        }
      }

      return true
    })
  }, [productosConPrecio, categoria, skuQuery])





  // const cargarCategoriasProductos = async () => {
  //   try {
  //     const res = await fetch(`${API_BASE_URL}/categorias-productos`)
  //     if (!res.ok) throw new Error('Error al obtener categorías de productos')
  //     const data = await res.json()
  //     // data = [{ id, nombre, descripcion, activo }, ...]

  //     const mapped = [
  //       { id: 'all', label: 'Todas' },
  //       ...data.map(cat => ({
  //         id: String(cat.id),        // lo pasamos a string por si acaso
  //         label: cat.nombre,
  //       })),
  //     ]

  //     setCategoriasProductos(mapped)
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }

  const cargarCategoriasProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias_producto`)
      if (!res.ok) throw new Error('Error al obtener clientes')
      const data = await res.json()
      setCategoriasProductos(data) // array de { id, nombre, descripcion, activo }
    } catch (err) {
      console.error(err)
    }
  }


  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      setProductos(data) // array de { id, nombre, descripcion, activo }
      console.log('Producto creado:', data)
    } catch (err) {
      console.error(err)
    }
  }
  const cargarClientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes`)
      if (!res.ok) throw new Error('Error al obtener clientes')
      const data = await res.json()
      setClientes(data) // array de { id, nombre, descripcion, activo }
    } catch (err) {
      console.error(err)
    }
  }
  const cargarTiposPago = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tipos_pago`)
      if (!res.ok) throw new Error('Error al obtener tipos de pago')
      const data = await res.json()
      setTiposPago(data) // array de { id, nombre, tipo, ... }
    } catch (err) {
      console.error(err)
    }
  }

  const cargarClientePorId = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes/${id}`)
      if (!res.ok) throw new Error('Error al obtener cliente')
      const data = await res.json()
      setClienteSeleccionado(data)
      setCliente({
        nombre: data.nombre ?? '',
        telefono: data.telefono ?? '',
        email: data.email ?? '',
        nit: data.nit ?? '',
      })
      setEsClienteExistente(true)
    } catch (err) {
      console.error(err)
    }
  }

  const addToCart = (prod, qtyToAdd = 1) => {
    const qty = Number(qtyToAdd) || 0
    if (qty <= 0) return

    setCart(prev => {
      const existing = prev.find(p => p.id === prod.id)

      const currentQty = existing ? existing.qty : 0
      const nextQty = currentQty + qty

      if (existing) {
        return prev.map(p => p.id === prod.id ? { ...p, qty: nextQty } : p)
      }
      return [...prev, { ...prod, qty }]
    })
  }
  const openQtySelector = (prod) => {
    setQtyDialog({
      open: true,
      product: prod,
      qty: 1,
      error: '',
    })
  }

  const handleClienteInputChange = (_, newInputValue) => {
    setCliente(prev => ({ ...prev, nombre: newInputValue, telefono: '', email: '', nit: '' }))
    setClienteSeleccionado(null)
    setEsClienteExistente(false)
  }

  const handleClienteChange = (_, newValue) => {
    if (!newValue) {
      setClienteSeleccionado(null)
      setEsClienteExistente(false)
      setCliente(prev => ({ ...prev, telefono: '', email: '', nit: '' }))
      return
    }

    if (typeof newValue === 'string') {
      setCliente({
        nombre: newValue,
        telefono: '',
        email: '',
        nit: '',
      })
      setClienteSeleccionado(null)
      setEsClienteExistente(false)
      return
    }

    setClienteSeleccionado(newValue)
    setCliente({
      nombre: newValue.nombre,
      telefono: newValue.telefono ?? '',
      email: newValue.email ?? '',
      nit: newValue.nit ?? '',
    })
    setEsClienteExistente(true)
    if (newValue.id) {
      cargarClientePorId(newValue.id)
    }
  }

  const handleConfirmQty = () => {
    const { product, qty } = qtyDialog
    const parsedQty = Number(qty)

    if (!product) return
    if (!Number.isFinite(parsedQty) || parsedQty <= 0 || !Number.isInteger(parsedQty)) {
      setQtyDialog(prev => ({ ...prev, error: 'Ingresa una cantidad entera mayor a 0' }))
      return
    }

    addToCart(product, parsedQty)
    setQtyDialog({ open: false, product: null, qty: 1, error: '' })
  }

  const handleCloseQtyDialog = () => {
    setQtyDialog({ open: false, product: null, qty: 1, error: '' })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id))

  const subtotal = cart.reduce((sum, p) => sum + p.precio * p.qty, 0)

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      setSnack({ open: true, msg: 'Tu carrito está vacío', severity: 'warning' })
      return
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const validate = () => {
    let ok = true
    const e = { nombre: '', telefono: '' }

    if (!cliente.nombre.trim()) {
      e.nombre = 'Ingresa el nombre'
      ok = false
    }
    const tel = cliente.telefono.trim()
    // Validación simple: 8–15 dígitos (permite + y espacios)
    const telOk = /^(\+?\d[\d\s-]{7,14})$/.test(tel)
    if (!telOk) {
      e.telefono = 'Ingresa un número válido (8–15 dígitos)'
      ok = false
    }
    setErrors(e)
    return ok
  }

  const handleConfirmCheckout = async () => {
    if (!validate()) return
    if (cart.length === 0) {
      setSnack({ open: true, msg: 'Tu carrito está vacío', severity: 'warning' })
      return
    }
    if (!clienteSeleccionado?.id) {
      setSnack({ open: true, msg: 'Selecciona un cliente existente', severity: 'warning' })
      return
    }

    // 1) Cliente: existente o nuevo
    const tipoPagoId = Number(venta.tipoPagoDetalle)
    if (!Number.isFinite(tipoPagoId)) {
      setSnack({ open: true, msg: 'Selecciona un tipo de pago válido', severity: 'warning' })
      return
    }

    // 2) Items (solo productos)
    const itemsPayload = cart.map((item) => ({
      producto_id: item.id,
      cantidad: item.qty,
      precio: Number(item.precio),
    }))

    // 3) Body para /ordenes
    const fechaHoy = new Date().toISOString().slice(0, 10)
    const body = {
      fecha: fechaHoy,
      tipo_pago_id: tipoPagoId,
      estado_id: DEFAULT_ESTADO_ID,
      cliente_id: clienteSeleccionado.id,
      items: itemsPayload,
      total: subtotal,
    }

    console.log('Payload para /ordenes:', body)

    try {
      const res = await fetch(`${API_BASE_URL}/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Error al crear orden:', errorText)
        setSnack({
          open: true,
          msg: 'Error al crear la orden ❌',
          severity: 'error',
        })
        return
      }

      const data = await res.json()
      console.log('Orden creada en backend:', data)

      // Feedback y limpieza
      setSnack({
        open: true,
        msg: 'Pedido creado correctamente ✅',
        severity: 'success',
      })
      setOpenDialog(false)
      setCliente({ nombre: '', telefono: '', email: '', nit: '' })
      setClienteSeleccionado(null)
      setEsClienteExistente(false)
      setCart([])

    } catch (err) {
      console.error('Error de red al crear orden:', err)
      setSnack({
        open: true,
        msg: 'Error de conexión al crear la orden ❌',
        severity: 'error',
      })
    }
  }



  React.useEffect(() => {
      cargarCategoriasProductos()
      cargarProductos()
      cargarClientes()
      cargarTiposPago()
    }, [])

  React.useEffect(() => {
    if (!clasificacionSeleccionada) return
    setCart((prev) => (
      prev.map((item) => ({
        ...item,
        precio: getPrecioForCliente(item, clasificacionSeleccionada),
      }))
    ))
  }, [clasificacionSeleccionada])
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* -------- IZQUIERDA: INVENTARIO -------- */}
      <Box sx={{ flex: 3 }}>
        <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>
          Productos
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          {/* Categoría */}
          <Autocomplete
            size="small"
            fullWidth
            options={categoriasProductos}
            value={categoria}
            onChange={(_, newValue) => setCategoria(newValue)}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option?.nombre || ''
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField {...params} label="Filtrar por categoría" placeholder="Categoría" />
            )}
          />
        </Stack>

        {/* Buscador por SKU */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por SKU"
            placeholder="Escanea o escribe el código de barras"
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
          />
        </Box>

        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Table
            size="large"
            stickyHeader
            sx={{
              '& .MuiTableCell-root': { fontSize: '1.25rem' },
              '& .MuiTableCell-head': { fontWeight: 700, fontSize: '1.25rem' },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Precio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((prod) => {
                const precio = Number(prod.precio)
                const precioTexto = Number.isFinite(precio) ? `Q ${precio.toFixed(2)}` : 'Q 0.00'

                return (
                  <TableRow
                    key={prod.id}
                    hover
                    onClick={() => openQtySelector(prod)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{prod.codigo || '-'}</TableCell>
                    <TableCell>{prod.descripcion || prod.nombre || ''}</TableCell>
                    <TableCell align="right">
                      {hasClienteSeleccionado
                        ? precioTexto
                        : 'Selecciona cliente'}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">
                      No hay productos en esta categoría
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>

      {/* -------- DIALOG: CANTIDAD -------- */}
      <Dialog
        open={qtyDialog.open}
        onClose={handleCloseQtyDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Selecciona la cantidad</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {qtyDialog.product?.descripcion || qtyDialog.product?.nombre}
            </Typography>
            <TextField
              autoFocus
              label="Cantidad"
              type="number"
              value={qtyDialog.qty}
              onChange={(e) =>
                setQtyDialog(prev => ({
                  ...prev,
                  qty: e.target.value,
                  error: '',
                }))
              }
              inputProps={{ min: 1, step: 1 }}
              error={!!qtyDialog.error}
              helperText={qtyDialog.error}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQtyDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmQty}>
            Añadir a la orden
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- DERECHA: CARRITO -------- */}
      <Box
        sx={{
          flex: 1,
          borderLeft: 1,
          borderColor: 'divider',
          p: 2,
          minWidth: 300,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Orden
        </Typography>
        <Autocomplete
          fullWidth
          size="small"
          freeSolo
          options={clientes}
          filterOptions={filterClientes}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.nombre
          }
          value={esClienteExistente ? clienteSeleccionado : null}
          inputValue={cliente.nombre}
          onInputChange={handleClienteInputChange}
          onChange={handleClienteChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Selecciona cliente"
              placeholder="Nombre del cliente"
            />
          )}
          sx={{ mb: 1 }}
        />
        <Divider sx={{ mb: 1 }} />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <List dense>
            {cart.map(item => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${item.descripcion}`}
                  secondary={
                    hasClienteSeleccionado
                      ? `Q ${item.precio.toFixed(2)} x ${item.qty}`
                      : 'Selecciona cliente para ver precios'
                  }
                />
              </ListItem>
            ))}
          </List>

          {cart.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              No hay productos en la orden
            </Typography>
          )}
        </Box>

        <Divider sx={{ mt: 1, mb: 2 }} />

        <Box sx={{ textAlign: 'right' }}>
          <Stack spacing={1} alignItems="flex-end">
            {hasClienteSeleccionado ? (
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Total: Q {subtotal.toFixed(2)}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Selecciona un cliente para ver precios y totales
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              disabled={cart.length === 0 || !hasClienteSeleccionado}
              onClick={handleOpenCheckout}
            >
              Finalizar compra
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* -------- DIALOG: DATOS DEL CLIENTE -------- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Datos del cliente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              fullWidth
              freeSolo                          // permite escribir valores no existentes
              options={clientes}                // [{ id, nombre, telefono }, ...]
              filterOptions={filterClientes}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.nombre
              }
              value={esClienteExistente ? clienteSeleccionado : null}
              inputValue={cliente.nombre}
              onInputChange={handleClienteInputChange}
              onChange={handleClienteChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  label="Nombre completo"
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              )}
            />

            {!esClienteExistente && (
              <TextField
                label="Número de teléfono"
                value={cliente.telefono}
                onChange={(e) =>
                  setCliente(prev => ({ ...prev, telefono: e.target.value }))
                }
                error={!!errors.telefono}
                helperText={errors.telefono}
                fullWidth
                inputMode="tel"
                placeholder="+502 5555 5555"
              />
            )}

            {!esClienteExistente && (
              <TextField
                label="Correo electrónico"
                value={cliente.email}
                onChange={(e) =>
                  setCliente(prev => ({ ...prev, email: e.target.value }))
                }
                fullWidth
                type="email"
                placeholder="cliente@correo.com"
              />
            )}

            {!esClienteExistente && (
              <TextField
                label="NIT"
                value={cliente.nit}
                onChange={(e) =>
                  setCliente(prev => ({ ...prev, nit: e.target.value }))
                }
                fullWidth
                placeholder="CF o número de NIT"
              />
            )}
            {/* <TextField
              autoFocus
              select
              label="Tipo de Pago"
              value={venta.empleada}
              onChange={(e) => setVenta(prev => ({ ...prev, pago: e.target.value }))}
              error={!!errors.pago}
              helperText={errors.pago}
              fullWidth
            >
              {tipoPago.map((pago) => (
                <MenuItem key={pago.id} value={pago.nombre}>
                  {pago.nombre}
                </MenuItem>
              ))}
            </TextField> */}
            <TextField
              autoFocus
              select
              label="Tipo de Pago"
              value={venta.tipoPago}
              onChange={(e) =>
                setVenta(prev => ({
                  ...prev,
                  tipoPago: e.target.value,
                  tipoPagoDetalle: '',
                  referencia: '',
                }))
              }
              error={!!errors.pago}
              helperText={errors.pago}
              fullWidth
            >
              {TIPO_PAGO_GRUPOS.map((pago) => (
                <MenuItem key={pago.id} value={pago.id}>
                  {pago.label}
                </MenuItem>
              ))}
            </TextField>

            {venta.tipoPago && (
              <TextField
                select
                label={venta.tipoPago === 'credito' ? 'Días de crédito' : 'Forma de pago'}
                value={venta.tipoPagoDetalle}
                onChange={(e) =>
                  setVenta(prev => ({ ...prev, tipoPagoDetalle: e.target.value }))
                }
                error={!!errors.pago}
                helperText={errors.pago}
                fullWidth
              >
                {pagoDetalleOpciones.map((detalle) => (
                  <MenuItem key={detalle.id} value={detalle.id}>
                    {getTipoPagoLabel(detalle)}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {requiereReferencia && (
              <TextField
                label="Referencia"
                value={venta.referencia}
                onChange={(e) =>
                  setVenta(prev => ({ ...prev, referencia: e.target.value }))
                }
                error={!!errors.referencia}
                helperText={errors.referencia}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmCheckout}>
            Confirmar pedido
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- SNACKBAR -------- */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>

    </Box>
  )
}
