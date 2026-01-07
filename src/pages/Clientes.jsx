import * as React from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Checkbox, MenuItem
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import dayjs from 'dayjs'
import { API_BASE_URL } from '../config/api'

// Calcula total de una orden a partir de sus items
function calcTotal(items = []) {
  return items.reduce((s, it) => {
    const precio = it.precio ?? it.price ?? it.precio_unitario ?? 0
    const qty = it.cantidad ?? it.qty ?? 1
    return s + precio * qty
  }, 0)
}

const DEPARTAMENTOS_GUATEMALA = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa',
]

const DEPARTAMENTO_ABBR = {
  'Alta Verapaz': 'AV',
  'Baja Verapaz': 'BV',
  'Chimaltenango': 'CHM',
  'Chiquimula': 'CHQ',
  'El Progreso': 'PRO',
  'Escuintla': 'ESC',
  'Guatemala': 'GUA',
  'Huehuetenango': 'HUE',
  'Izabal': 'IZA',
  'Jalapa': 'JAL',
  'Jutiapa': 'JUT',
  'Petén': 'PET',
  'Quetzaltenango': 'QUE',
  'Quiché': 'QUI',
  'Retalhuleu': 'RET',
  'Sacatepéquez': 'SAC',
  'San Marcos': 'SM',
  'Santa Rosa': 'SR',
  'Sololá': 'SOL',
  'Suchitepéquez': 'SUC',
  'Totonicapán': 'TOT',
  'Zacapa': 'ZAC',
}

const getInitials = (name) => {
  return (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

const buildCodigoCliente = ({ nombre, departamento }) => {
  const initials = getInitials(nombre)
  const unique = Date.now().toString().slice(-6)
  const deptoAbbr = DEPARTAMENTO_ABBR[departamento] || ''
  return [initials, unique, deptoAbbr].filter(Boolean).join('')
}

export default function Clientes() {
  const [query, setQuery] = React.useState('')
  const [ordenes, setOrdenes] = React.useState([])
  const [clientesRaw, setClientesRaw] = React.useState([])
  const [estadosOrden, setEstadosOrden] = React.useState([])
  const [tiposPago, setTiposPago] = React.useState([])
  const [clienteSel, setClienteSel] = React.useState(null)   // objeto cliente agregado
  const [ordenSel, setOrdenSel] = React.useState(null)       // objeto orden para el diálogo
  const [abonoDialog, setAbonoDialog] = React.useState({
    open: false,
    cliente: null,
    selected: new Set(),
  })
  const [clienteDialog, setClienteDialog] = React.useState({
    open: false,
    nombre: '',
    telefono: '',
    departamento: '',
    direccion: '',
    clasificacion: 'cf',
    loading: false,
    error: '',
  })
  

  // Cargar órdenes desde el backend
  React.useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ordenes`)
        if (!res.ok) {
          const txt = await res.text()
          console.error('Error backend /ordenes:', txt)
          return
        }
        const data = await res.json()
        console.log('Ordenes cargadas:', data)
        setOrdenes(data)
      } catch (err) {
        console.error('Error de red al cargar ordenes:', err)
      }
    }

    cargarOrdenes()
  }, [])

  // Cargar clientes desde el backend
  React.useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clientes`)
        if (!res.ok) {
          const txt = await res.text()
          console.error('Error backend /clientes:', txt)
          return
        }
        const data = await res.json()
        setClientesRaw(data || [])
      } catch (err) {
        console.error('Error de red al cargar clientes:', err)
      }
    }

    cargarClientes()
  }, [])

  // Cargar tipos de pago desde el backend
  React.useEffect(() => {
    const cargarTiposPago = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/tipos_pago`)
        if (!res.ok) {
          const txt = await res.text()
          console.error('Error backend /tipos_pago:', txt)
          return
        }
        const data = await res.json()
        setTiposPago(data || [])
      } catch (err) {
        console.error('Error de red al cargar tipos de pago:', err)
      }
    }

    cargarTiposPago()
  }, [])

  // Cargar estados de orden desde el backend
  React.useEffect(() => {
    const cargarEstadosOrden = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/estados_orden`)
        if (!res.ok) {
          const txt = await res.text()
          console.error('Error backend /estados_orden:', txt)
          return
        }
        const data = await res.json()
        setEstadosOrden(data || [])
      } catch (err) {
        console.error('Error de red al cargar estados:', err)
      }
    }

    cargarEstadosOrden()
  }, [])

  const ordenesPendientesPago = React.useMemo(() => {
    const estadoPendiente = estadosOrden.find(
      (estado) => String(estado?.nombre || '').toLowerCase() === 'pendiente de pago'
    )
    if (!estadoPendiente?.id) return ordenes
    return ordenes.filter(
      (orden) => String(orden?.estado_id) === String(estadoPendiente.id)
    )
  }, [ordenes, estadosOrden])

  // ---- Construir "clientes" agregando info desde las órdenes ----
  const clientes = React.useMemo(() => {
    const ordersByCliente = new Map()
    for (const o of ordenesPendientesPago) {
      const id = o.cliente_id ?? o.cliente?.id
      if (id == null) continue
      if (!ordersByCliente.has(id)) {
        ordersByCliente.set(id, [])
      }
      ordersByCliente.get(id).push(o)
    }

    let arr = (clientesRaw || []).map((cli) => {
      const orders = ordersByCliente.get(cli.id) || []
      const total = orders.reduce((sum, o) => sum + calcTotal(o.items || []), 0)
      let ultima = null
      for (const o of orders) {
        if (!ultima || dayjs(o.fecha).isAfter(dayjs(ultima))) {
          ultima = o.fecha
        }
      }
      return {
        ...cli,
        ordenes: orders,
        total,
        ultima,
      }
    })

    // filtro por texto (nombre o teléfono)
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(c =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q) ||
        (c.codigo || '').toLowerCase().includes(q)
      )
    }

    // ordenar por última compra desc (clientes sin fecha se van al final)
    arr.sort((a, b) => {
      const aDate = a.ultima ? dayjs(a.ultima).valueOf() : -Infinity
      const bDate = b.ultima ? dayjs(b.ultima).valueOf() : -Infinity
      return bDate - aDate
    })
    return arr
  }, [ordenesPendientesPago, query, clientesRaw])

  const clientesById = React.useMemo(() => {
    const map = {}
    for (const cli of clientesRaw || []) {
      if (cli?.id != null) {
        map[cli.id] = cli
      }
    }
    return map
  }, [clientesRaw])

  // Órdenes del cliente seleccionado
  const ordenesCliente = React.useMemo(() => {
    if (!clienteSel) return []
    return clienteSel.ordenes
      .slice()
      .sort((a, b) => dayjs(a.fecha).valueOf() - dayjs(b.fecha).valueOf())
  }, [clienteSel])

  const saldoCliente = React.useMemo(() => {
    if (!clienteSel) return 0
    const totalOrdenes = (clienteSel.ordenes || []).reduce(
      (sum, orden) => sum + calcTotal(orden.items || []),
      0
    )
    return Number.isFinite(totalOrdenes) ? totalOrdenes : 0
  }, [clienteSel])

  const abonosCliente = React.useMemo(() => {
    if (!clienteSel) return 0
    const raw = clienteSel.abonos ?? clienteSel.total_abonos ?? 0
    const num = Number(raw)
    return Number.isFinite(num) ? num : 0
  }, [clienteSel])

  const getDiasCreditoForOrden = React.useCallback((orden) => {
    const tipoPagoKey = orden?.tipo_pago_id != null ? String(orden.tipo_pago_id) : ''
    let tipoPagoSeleccionado = null
    for (const tipo of tiposPago) {
      if (String(tipo?.id) === tipoPagoKey) {
        tipoPagoSeleccionado = tipo
        break
      }
    }
    const nombrePago = (tipoPagoSeleccionado?.nombre || '').toLowerCase()
    if (!nombrePago.includes('credito')) return 0

    const firstToken = nombrePago.trim().split(/\s+/)[0]
    const diasCredito = Number(firstToken)
    return Number.isFinite(diasCredito) ? diasCredito : 0
  }, [tiposPago])

  const pagosPendientesCliente = React.useMemo(() => {
    const c = abonoDialog.cliente
    if (!c) return []

    const fromClient =
      c.pagosPendientes ||
      c.pagos_pendientes ||
      c.pagos

    if (Array.isArray(fromClient) && fromClient.length) return fromClient

    // Mock data to show UI when backend no responde
    return [
      { id: 'mock-1', fecha: '2024-10-01', referencia: 'REF-001', cantidad: 150.0 },
      { id: 'mock-2', fecha: '2024-10-05', referencia: 'REF-002', cantidad: 320.5 },
      { id: 'mock-3', fecha: '2024-10-12', referencia: 'REF-003', cantidad: 80.0 },
    ]
  }, [abonoDialog.cliente])

  const totalSeleccionadoAbono = React.useMemo(() => {
    if (!abonoDialog.selected || pagosPendientesCliente.length === 0) return 0
    return pagosPendientesCliente.reduce((sum, pago) => {
      return abonoDialog.selected.has(pago.id) ? sum + Number(pago.cantidad || 0) : sum
    }, 0)
  }, [abonoDialog.selected, pagosPendientesCliente])

  const togglePagoSeleccion = (id) => {
    setAbonoDialog(prev => {
      const next = new Set(prev.selected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...prev, selected: next }
    })
  }

  const handleOpenAbono = (cliente) => {
    setAbonoDialog({ open: true, cliente, selected: new Set() })
  }

  const handleCerrarAbono = () => {
    setAbonoDialog({ open: false, cliente: null, selected: new Set() })
  }

  const handleConfirmarAbono = () => {
    console.log('Asignar abonos', {
      cliente: abonoDialog.cliente,
      seleccion: Array.from(abonoDialog.selected),
    })
    handleCerrarAbono()
  }

  const handleOpenClienteDialog = () => {
    setClienteDialog({
      open: true,
      nombre: '',
      telefono: '',
      departamento: '',
      direccion: '',
      clasificacion: 'cf',
      loading: false,
      error: '',
    })
  }

  const handleCloseClienteDialog = () => {
    setClienteDialog((prev) => ({ ...prev, open: false, loading: false }))
  }

  const handleCrearCliente = async (e) => {
    e?.preventDefault()
    setClienteDialog((prev) => ({ ...prev, loading: true, error: '' }))

    const nombre = (clienteDialog.nombre || '').trim()
    const telefono = clienteDialog.telefono.trim() || null
    const direccionInput = clienteDialog.direccion.trim()
    const departamento = (clienteDialog.departamento || '').trim()
    const direccion = departamento
      ? [departamento, direccionInput].filter(Boolean).join(', ')
      : (direccionInput || null)
    const clasificacion_precio = clienteDialog.clasificacion

    if (!nombre) {
      setClienteDialog((prev) => ({
        ...prev,
        loading: false,
        error: 'Nombre es requerido',
      }))
      return
    }
    const codigo = buildCodigoCliente({ nombre, departamento })

    try {
      const res = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          nombre,
          telefono,
          direccion,
          clasificacion_precio,
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo crear el cliente'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setClienteDialog((prev) => ({ ...prev, loading: false, error: msg }))
        return
      }

      const data = await res.json()
      const nuevoCliente = {
        ...data,
        ordenes: [],
        total: 0,
        ultima: data.creado_en || new Date().toISOString(),
      }
      setClientesRaw((prev) => [...prev, nuevoCliente])
      setClienteSel(nuevoCliente)
      handleCloseClienteDialog()
    } catch (err) {
      console.error('Error creando cliente:', err)
      setClienteDialog((prev) => ({
        ...prev,
        loading: false,
        error: 'Error de red al crear el cliente',
      }))
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Clientes
      </Typography>

      {/* Filtros / búsqueda */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            label="Buscar cliente (nombre, teléfono o código)"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Clientes: ${clientes.length}`} />
            <Button
              variant="contained"
              startIcon={<PersonAddAltIcon />}
              onClick={handleOpenClienteDialog}
            >
              Nuevo cliente
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* -------- Tabla de clientes -------- */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Órdenes</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Última compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map(c => {
                const tieneVencidas = (c.ordenes || []).some((orden) => {
                  const diasCredito = getDiasCreditoForOrden(orden)
                  if (!diasCredito || diasCredito <= 0) return false
                  const diasTranscurridos = orden?.fecha
                    ? dayjs().diff(dayjs(orden.fecha), 'day')
                    : 0
                  const diasRestantes = diasCredito - diasTranscurridos
                  return diasRestantes <= 0
                })
                const rowBg = tieneVencidas ? '#fdecea' : undefined
                const rowColor = tieneVencidas ? '#c62828' : undefined
                return (
                <TableRow
                  key={c.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: rowBg,
                    color: rowColor,
                    '&:hover': { backgroundColor: rowBg },
                    ...(rowColor
                      ? {
                          '& td:first-of-type': {
                            borderLeft: `4px solid ${rowColor}`,
                            paddingLeft: 12,
                          },
                        }
                      : null),
                  }}
                  onClick={() => setClienteSel(c)}
                  selected={clienteSel?.id === c.id}
                >
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.telefono}</TableCell>
                  <TableCell align="right">{c.ordenes.length}</TableCell>
                  <TableCell align="right">Q {Number(c.total || 0).toFixed(2)}</TableCell>
                  <TableCell>{c.ultima ? dayjs(c.ultima).format('YYYY-MM-DD') : '—'}</TableCell>
                </TableRow>
                )
              })}
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center" color="text.secondary">
                      No hay clientes que coincidan
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* -------- Detalle: órdenes del cliente seleccionado -------- */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, flex: 1, minWidth: 420 }}
        >
          <Box
            sx={{
              p: 2,
              pb: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {clienteSel ? `Órdenes de ${clienteSel.nombre}` : 'Selecciona un cliente'}
              </Typography>
              {clienteSel && (
                <Typography variant="body2" color="text.secondary">
                  {clienteSel.telefono} — Total gastado: Q {clienteSel.total.toFixed(2)}
                </Typography>
              )}
              {clienteSel && (
                <Typography variant="body2" color="text.secondary">
                  {clienteSel.direccion ? `Dirección: ${clienteSel.direccion}` : 'Dirección: —'}
                </Typography>
              )}
              {clienteSel && (
                <Typography variant="body2" color="text.secondary">
                  {clienteSel.codigo ? `Código: ${clienteSel.codigo}` : 'Código: —'}
                </Typography>
              )}
              {clienteSel && (
                <Typography variant="body2" color="text.secondary">
                  {clienteSel.clasificacion_precio ? `Clasificación: ${clienteSel.clasificacion_precio}` : 'Clasificación: —'}
                </Typography>
              )}
            </Box>
            {clienteSel && (
              <Button
                size="small"
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={() => handleOpenAbono(clienteSel)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Agregar abono
              </Button>
            )}
          </Box>

          {clienteSel && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5, px: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  bgcolor: '#ffe5e5',
                  border: '1px solid #e57373',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">Saldo</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#c62828' }}>
                  Q {saldoCliente.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  bgcolor: '#e8f5e9',
                  border: '1px solid #81c784',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">Abonos</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                  Q {abonosCliente.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          )}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>No. Orden</TableCell>
                <TableCell align="right">Días crédito</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenesCliente.map(o => (
                (() => {
                  const fechaOrden = o.fecha
                  const diasTranscurridos = fechaOrden
                    ? dayjs().diff(dayjs(fechaOrden), 'day')
                    : 0
                  const diasCredito = getDiasCreditoForOrden(o)
                  const diasRestantes = diasCredito - diasTranscurridos
                  const rowColor = diasRestantes <= 0 ? '#c62828' : '#2e7d32'
                  const rowBg = diasRestantes <= 0 ? '#fdecea' : '#e8f5e9'
                  return (
                <TableRow
                  key={o.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    color: rowColor,
                    backgroundColor: rowBg,
                    '&:hover': { backgroundColor: rowBg },
                  }}
                  onClick={() => setOrdenSel(o)}
                >
                  <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{o.codigo || o.id}</TableCell>
                  <TableCell align="right">
                    {diasRestantes} días
                  </TableCell>
                  <TableCell align="right">Q {calcTotal(o.items).toFixed(2)}</TableCell>
                </TableRow>
                  )
                })()
              ))}
              {clienteSel && ordenesCliente.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography align="center" color="text.secondary">
                      Este cliente no tiene órdenes
                    </Typography>
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>

      {/* -------- Dialog Abonos -------- */}
      <Dialog open={abonoDialog.open} onClose={handleCerrarAbono} maxWidth="md" fullWidth>
        <DialogTitle>
          Asignar abonos {abonoDialog.cliente ? `a ${abonoDialog.cliente.nombre}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          {pagosPendientesCliente.length === 0 && (
            <Typography color="text.secondary">
              No hay pagos pendientes de asignar para este cliente.
            </Typography>
          )}
          {pagosPendientesCliente.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="50" />
                  <TableCell>Fecha</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagosPendientesCliente.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell>
                      <Checkbox
                        checked={abonoDialog.selected.has(pago.id)}
                        onChange={() => togglePagoSeleccion(pago.id)}
                      />
                    </TableCell>
                    <TableCell>{pago.fecha || pago.created_at || '—'}</TableCell>
                    <TableCell>{pago.referencia || pago.ref || '—'}</TableCell>
                    <TableCell align="right">Q {Number(pago.cantidad || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {pagosPendientesCliente.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Seleccionados: {abonoDialog.selected.size}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Total a asignar: Q {totalSeleccionadoAbono.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarAbono}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmarAbono}
            disabled={abonoDialog.selected.size === 0}
          >
            Confirmar abono
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- Dialog Detalle de Orden -------- */}
      <Dialog open={!!ordenSel} onClose={() => setOrdenSel(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Orden {ordenSel?.codigo || ordenSel?.id}</DialogTitle>
        <DialogContent dividers>
          {(() => {
            const clienteOrden = ordenSel?.cliente ?? clientesById[ordenSel?.cliente_id]
            return (
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha:{' '}
                  {ordenSel ? dayjs(ordenSel.fecha).format('YYYY-MM-DD') : '--'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {clienteOrden?.nombre || '—'} — {clienteOrden?.telefono || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dirección: {clienteOrden?.direccion || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Código: {clienteOrden?.codigo || '—'}
                </Typography>
              </Stack>
            )
          })()}

          <Divider sx={{ mb: 2 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto / Servicio</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Cant.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenSel?.items?.map((it) => {
                const nombre =
                  it.nombre ||
                  it.name ||
                  (it.producto_id
                    ? `Producto #${it.producto_id}`
                    : it.servicio_id
                    ? `Servicio #${it.servicio_id}`
                    : `Item ${it.id}`)

                const sku = it.producto?.codigo || it.codigo || ''

                const precio = it.precio ?? it.price ?? it.precio_unitario ?? 0
                const qty = it.cantidad ?? it.qty ?? 1
                const subtotal = precio * qty

                return (
                  <TableRow key={it.id}>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{sku}</TableCell>
                    <TableCell align="right">Q {precio.toFixed(2)}</TableCell>
                    <TableCell align="right">{qty}</TableCell>
                    <TableCell align="right">Q {subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Q {ordenSel ? calcTotal(ordenSel.items).toFixed(2) : '0.00'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdenSel(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* -------- Dialog Nuevo Cliente -------- */}
      <Dialog open={clienteDialog.open} onClose={handleCloseClienteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo cliente</DialogTitle>
        <form onSubmit={handleCrearCliente}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              value={clienteDialog.nombre}
              onChange={(e) => setClienteDialog((prev) => ({ ...prev, nombre: e.target.value }))}
              required
            />
            <TextField
              label="Teléfono"
              value={clienteDialog.telefono}
              onChange={(e) => setClienteDialog((prev) => ({ ...prev, telefono: e.target.value }))}
            />
            <TextField
              select
              label="Departamento"
              value={clienteDialog.departamento}
              onChange={(e) =>
                setClienteDialog((prev) => ({ ...prev, departamento: e.target.value }))
              }
              placeholder="Selecciona departamento"
            >
              {DEPARTAMENTOS_GUATEMALA.map((depto) => (
                <MenuItem key={depto} value={depto}>
                  {depto}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Dirección"
              value={clienteDialog.direccion}
              onChange={(e) => setClienteDialog((prev) => ({ ...prev, direccion: e.target.value }))}
              multiline
              minRows={2}
            />
            <TextField
              select
              label="Clasificación de precio"
              value={clienteDialog.clasificacion}
              onChange={(e) =>
                setClienteDialog((prev) => ({ ...prev, clasificacion: e.target.value }))
              }
            >
              <MenuItem value="cf">CF</MenuItem>
              <MenuItem value="minorista">Minorista</MenuItem>
              <MenuItem value="mayorista">Mayorista</MenuItem>
            </TextField>
            {clienteDialog.error && (
              <Typography variant="body2" color="error">
                {clienteDialog.error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseClienteDialog} disabled={clienteDialog.loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              type="submit"
              startIcon={<PersonAddAltIcon />}
              disabled={clienteDialog.loading}
            >
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
