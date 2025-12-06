import * as React from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider
} from '@mui/material'
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

export default function Clientes() {
  const [query, setQuery] = React.useState('')
  const [ordenes, setOrdenes] = React.useState([])
  const [clienteSel, setClienteSel] = React.useState(null)   // objeto cliente agregado
  const [ordenSel, setOrdenSel] = React.useState(null)       // objeto orden para el diálogo

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

  // ---- Construir "clientes" agregando info desde las órdenes ----
  const clientes = React.useMemo(() => {
    const map = new Map()

    for (const o of ordenes) {
      const cli = o.cliente || {}
      const key = cli.id || cli.telefono || cli.nombre
      if (!key) continue

      const totalOrden = calcTotal(o.items || [])

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          nombre: cli.nombre,
          telefono: cli.telefono,
          email: cli.email,
          nit: cli.nit,
          ordenes: [o],
          total: totalOrden,
          ultima: o.fecha,
        })
      } else {
        const c = map.get(key)
        c.ordenes.push(o)
        c.total += totalOrden
        c.ultima = dayjs(o.fecha).isAfter(dayjs(c.ultima)) ? o.fecha : c.ultima
      }
    }

    let arr = Array.from(map.values())

    // filtro por texto (nombre o teléfono)
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(c =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q)
      )
    }

    // ordenar por última compra desc
    arr.sort((a, b) => dayjs(b.ultima).valueOf() - dayjs(a.ultima).valueOf())
    return arr
  }, [ordenes, query])

  // Órdenes del cliente seleccionado
  const ordenesCliente = React.useMemo(() => {
    if (!clienteSel) return []
    return clienteSel.ordenes
      .slice()
      .sort((a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf())
  }, [clienteSel])

  const saldoCliente = React.useMemo(() => {
    if (!clienteSel) return 0
    const raw = clienteSel.saldo ?? clienteSel.balance ?? 0
    const num = Number(raw)
    return Number.isFinite(num) ? num : 0
  }, [clienteSel])

  const abonosCliente = React.useMemo(() => {
    if (!clienteSel) return 0
    const raw = clienteSel.abonos ?? clienteSel.total_abonos ?? 0
    const num = Number(raw)
    return Number.isFinite(num) ? num : 0
  }, [clienteSel])

  const diasRestantes = React.useMemo(() => {
    if (!clienteSel) return 0
    const raw =
      clienteSel.dias_restantes ??
      clienteSel.diasRestantes ??
      clienteSel.dias_credito ??
      clienteSel.diasCredito ??
      0
    const num = Number(raw)
    return Number.isFinite(num) ? num : 0
  }, [clienteSel])

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Clientes
      </Typography>

      {/* Filtros / búsqueda */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Buscar cliente (nombre o teléfono)"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <Chip label={`Clientes: ${clientes.length}`} />
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
                <TableCell align="right">Total gastado</TableCell>
                <TableCell>Última compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map(c => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setClienteSel(c)}
                  selected={clienteSel?.id === c.id}
                >
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.telefono}</TableCell>
                  <TableCell align="right">{c.ordenes.length}</TableCell>
                  <TableCell align="right">Q {c.total.toFixed(2)}</TableCell>
                  <TableCell>{dayjs(c.ultima).format('YYYY-MM-DD HH:mm')}</TableCell>
                </TableRow>
              ))}
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
          <Box sx={{ p: 2, pb: 0 }}>
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
                {clienteSel.email ? `Email: ${clienteSel.email}` : 'Email: —'}
              </Typography>
            )}
            {clienteSel && (
              <Typography variant="body2" color="text.secondary">
                {clienteSel.nit ? `NIT: ${clienteSel.nit}` : 'NIT: —'}
              </Typography>
            )}
            {clienteSel && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
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
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    bgcolor: diasRestantes >= 0 ? '#e8f5e9' : '#ffe5e5',
                    border: `1px solid ${diasRestantes >= 0 ? '#81c784' : '#e57373'}`,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Días crédito</Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: diasRestantes >= 0 ? '#2e7d32' : '#c62828',
                    }}
                  >
                    {diasRestantes} días
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>No. Orden</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenesCliente.map(o => (
                <TableRow
                  key={o.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setOrdenSel(o)}
                >
                  <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{o.codigo || o.id}</TableCell>
                  <TableCell align="right">Q {calcTotal(o.items).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {clienteSel && ordenesCliente.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
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

      {/* -------- Dialog Detalle de Orden -------- */}
      <Dialog open={!!ordenSel} onClose={() => setOrdenSel(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Orden {ordenSel?.codigo || ordenSel?.id}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Fecha:{' '}
              {ordenSel ? dayjs(ordenSel.fecha).format('YYYY-MM-DD HH:mm') : '--'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cliente: {ordenSel?.cliente?.nombre} — {ordenSel?.cliente?.telefono}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {ordenSel?.cliente?.email || '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              NIT: {ordenSel?.cliente?.nit || '—'}
            </Typography>
          </Stack>

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

                const sku = it.producto?.sku || ''

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
    </Box>
  )
}
