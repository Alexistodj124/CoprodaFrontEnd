import * as React from 'react'
import {
  Box, Paper, Typography, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { API_BASE_URL } from '../config/api'

// --- Datos de ejemplo (luego los reemplazas por tu API/DB) ---

// Utilidades de totales
const getItemPrice = (item) => {
  const raw =
    item?.precio ??
    item?.price ??
    item?.precio_unitario ??
    item?.producto?.precio_minorista ??
    item?.producto?.precio_cf ??
    item?.producto?.precio_mayorista ??
    0
  const num = Number(raw)
  return Number.isFinite(num) ? num : 0
}

const getItemCost = (item) => {
  const raw = item?.costo_unitario ?? item?.costo ?? item?.producto?.costo ?? 0
  const num = Number(raw)
  return Number.isFinite(num) ? num : 0
}

const getItemQty = (item) => {
  const raw = item?.qty ?? item?.cantidad ?? 1
  const num = Number(raw)
  return Number.isFinite(num) ? num : 0
}

const normalizeNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const getOrdenDescuento = (orden) => normalizeNumber(orden?.descuento ?? orden?.discount ?? 0)
const calcSubtotal = (items = []) =>
  items.reduce((s, it) => s + getItemPrice(it) * getItemQty(it), 0)
const calcCostoTotal = (items = []) =>
  items.reduce((s, it) => s + getItemCost(it) * getItemQty(it), 0)

// Util: calcular total (restando el descuento de la orden si existe)
function calcTotal(items = [], descuento = 0) {
  const subtotal = calcSubtotal(items)
  const desc = Math.max(normalizeNumber(descuento), 0)
  const neto = subtotal - desc
  return neto < 0 ? 0 : neto
}

// Util: calcular ganancia de una lista de items
function calcGanancia(items = [], descuento = 0) {
  const subtotal = calcSubtotal(items)
  const costoTotal = calcCostoTotal(items)
  const desc = Math.max(normalizeNumber(descuento), 0)
  return subtotal - costoTotal - desc
}

export default function Pedidos2() {
  const [ordenes, setOrdenes] = React.useState([])
  const [productosById, setProductosById] = React.useState({})
  const [clientesById, setClientesById] = React.useState({})
  const [estadosOrden, setEstadosOrden] = React.useState([])
  const [range, setRange] = React.useState([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ])

  const filtered = React.useMemo(() => {
    const estadoPedido = estadosOrden.find(
      (estado) => String(estado?.nombre || '').toLowerCase() === 'confirmado'
    )
    if (!estadoPedido?.id) return ordenes
    return ordenes.filter(
      (orden) => String(orden?.estado_id) === String(estadoPedido.id)
    )
  }, [ordenes, estadosOrden])


  // 🔹 GET /ordenes?inicio=...&fin=...
  const cargarOrdenes = async (inicioIso, finIso) => {
    try {
      const params = new URLSearchParams()
      if (inicioIso) params.append('inicio', inicioIso)
      if (finIso)    params.append('fin',    finIso)

      const res = await fetch(`${API_BASE_URL}/ordenes?${params.toString()}`)
      if (!res.ok) throw new Error('Error al obtener órdenes')

      const data = await res.json()
      setOrdenes(data)   // array de ordenes desde el back
    } catch (err) {
      console.error(err)
    }
  }

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      const map = {}
      for (const producto of data || []) {
        if (producto?.id != null) {
          map[producto.id] = producto
        }
      }
      setProductosById(map)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarClientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes`)
      if (!res.ok) throw new Error('Error al obtener clientes')
      const data = await res.json()
      const map = {}
      for (const cliente of data || []) {
        if (cliente?.id != null) {
          map[cliente.id] = cliente
        }
      }
      setClientesById(map)
    } catch (err) {
      console.error(err)
    }
  }

  const cargarEstadosOrden = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/estados_orden`)
      if (!res.ok) throw new Error('Error al obtener estados de orden')
      const data = await res.json()
      setEstadosOrden(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const totalPeriodo = filtered.reduce(
    (acc, o) => acc + calcTotal(o.items || [], getOrdenDescuento(o)),
    0
  )

  const gananciaPeriodo = filtered.reduce(
    (acc, o) => acc + calcGanancia(o.items || [], getOrdenDescuento(o)),
    0
  )

  const [porcentajeComision, setPorcentajeComision] = React.useState(0);

  const totalComision = React.useMemo(
    () => (porcentajeComision ? (totalPeriodo * porcentajeComision) / 100 : 0),
    [totalPeriodo, porcentajeComision]
  )

  // 🔹 Cada vez que cambia el rango, pedir órdenes al backend
  React.useEffect(() => {
    const [from, to] = range
    if (!from || !to) return

    const inicioIso = from.startOf('day').toDate().toISOString()
    const finIso    = to.endOf('day').toDate().toISOString()

    cargarOrdenes(inicioIso, finIso)
  }, [range])

  React.useEffect(() => {
    cargarProductos()
    cargarClientes()
    cargarEstadosOrden()
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Ordenes
        </Typography>

        
        <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
          {/* Fila original: rango de fechas + total período */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <DateRangePicker
              calendars={2}
              value={range}
              onChange={(newVal) => setRange(newVal)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              localeText={{ start: 'Desde', end: 'Hasta' }}
            />

            {/* <Chip
              label={`Total en el período: Q ${totalPeriodo.toFixed(2)}`}
              color="primary"
              sx={{ fontWeight: 600 }}
            /> */}
          </Stack>

          
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>No. Orden</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.flatMap((o) => {
                const clienteInfo = o.cliente ?? clientesById[o.cliente_id]
                const items = o.items || []
                if (items.length === 0) {
                  return (
                    <TableRow key={`${o.id}-empty`} hover>
                      <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD')}</TableCell>
                      <TableCell>{o.codigo_orden || o.codigo || o.id}</TableCell>
                      <TableCell>{clienteInfo?.nombre || '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell align="right">0</TableCell>
                    </TableRow>
                  )
                }
                return items.map((item, idx) => {
                  const productoInfo = item?.producto ?? productosById[item?.producto_id]
                  const sku = productoInfo?.codigo || item?.codigo || item?.sku || '-'
                  const cantidad = item?.cantidad ?? item?.qty ?? 0
                  return (
                    <TableRow key={`${o.id}-${item?.id ?? sku}-${idx}`} hover>
                      <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD')}</TableCell>
                      <TableCell>{o.codigo_orden || o.codigo || o.id}</TableCell>
                      <TableCell>{clienteInfo?.nombre || '-'}</TableCell>
                      <TableCell>{sku}</TableCell>
                      <TableCell align="right">{cantidad}</TableCell>
                    </TableRow>
                  )
                })
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" align="center">
                      No hay ventas en el rango seleccionado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </TableContainer>

      </Box>
    </LocalizationProvider>
  )
}
