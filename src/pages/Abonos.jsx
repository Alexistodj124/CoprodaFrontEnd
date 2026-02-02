import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TextField,
  Chip,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { API_BASE_URL } from '../config/api'

const getAbonoFecha = (abono) => abono?.fecha || abono?.creado_en || null

export default function Abonos() {
  const [query, setQuery] = React.useState('')
  const [clientesRaw, setClientesRaw] = React.useState([])
  const [bancos, setBancos] = React.useState([])
  const [clienteSel, setClienteSel] = React.useState(null)
  const [fechaConsulta, setFechaConsulta] = React.useState(dayjs())

  const clientesById = React.useMemo(() => {
    const map = {}
    for (const cli of clientesRaw || []) {
      if (cli?.id != null) map[cli.id] = cli
    }
    return map
  }, [clientesRaw])

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

    const cargarBancos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bancos`)
        if (!res.ok) {
          const txt = await res.text()
          console.error('Error backend /bancos:', txt)
          return
        }
        const data = await res.json()
        setBancos(data || [])
      } catch (err) {
        console.error('Error de red al cargar bancos:', err)
      }
    }

    cargarClientes()
    cargarBancos()
  }, [])

  const clientes = React.useMemo(() => {
    const abonosByCliente = new Map()
    const hoy = dayjs()
    const inicioMes = hoy.startOf('month')
    const finMes = hoy.endOf('month')

    for (const abono of bancos || []) {
      const id = abono?.cliente_id
      if (id == null) continue
      const fecha = getAbonoFecha(abono)
      if (!fecha) continue
      const fechaAbono = dayjs(fecha)
      if (!fechaAbono.isValid()) continue
      if (fechaAbono.isBefore(inicioMes) || fechaAbono.isAfter(finMes)) continue
      if (!abonosByCliente.has(id)) {
        abonosByCliente.set(id, [])
      }
      abonosByCliente.get(id).push(abono)
    }

    let arr = (clientesRaw || []).map((cli) => {
      const abonos = abonosByCliente.get(cli.id) || []
      const total = abonos.reduce((sum, a) => sum + Number(a.monto || 0), 0)
      let ultima = null
      for (const a of abonos) {
        const fecha = a.fecha || a.creado_en
        if (!fecha) continue
        if (!ultima || dayjs(fecha).isAfter(dayjs(ultima))) {
          ultima = fecha
        }
      }
      return {
        ...cli,
        abonos,
        total_abonos: total,
        ultima_abono: ultima,
      }
    })

    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter((c) =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q) ||
        (c.codigo || '').toLowerCase().includes(q)
      )
    }

    arr.sort((a, b) => {
      const aDate = a.ultima_abono ? dayjs(a.ultima_abono).valueOf() : -Infinity
      const bDate = b.ultima_abono ? dayjs(b.ultima_abono).valueOf() : -Infinity
      return bDate - aDate
    })
    return arr
  }, [bancos, clientesRaw, query])

  React.useEffect(() => {
    if (!clienteSel) return
    setFechaConsulta(dayjs())
  }, [clienteSel])

  const saldoCliente = React.useMemo(() => {
    if (!clienteSel) return 0
    const raw = clientesById[clienteSel.id]?.saldo ?? clienteSel.saldo ?? 0
    const num = Number(raw)
    return Number.isFinite(num) ? num : 0
  }, [clienteSel, clientesById])

  const abonosClienteFiltrados = React.useMemo(() => {
    if (!clienteSel) return []
    const base = fechaConsulta && dayjs(fechaConsulta).isValid() ? dayjs(fechaConsulta) : dayjs()
    const inicioMes = base.startOf('month')
    const finMes = base.endOf('month')
    return (bancos || []).filter((abono) => {
      if (String(abono?.cliente_id) !== String(clienteSel.id)) return false
      const fecha = getAbonoFecha(abono)
      if (!fecha) return false
      const fechaAbono = dayjs(fecha)
      if (!fechaAbono.isValid()) return false
      return !fechaAbono.isBefore(inicioMes) && !fechaAbono.isAfter(finMes)
    })
  }, [clienteSel, fechaConsulta, bancos])

  const abonosCliente = React.useMemo(() => {
    if (!clienteSel) return 0
    const total = abonosClienteFiltrados.reduce(
      (sum, abono) => sum + Number(abono.monto || 0),
      0
    )
    return Number.isFinite(total) ? total : 0
  }, [clienteSel, abonosClienteFiltrados])

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Abonos por cliente
      </Typography>

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
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Abonos</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Último abono</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setClienteSel(c)}
                  selected={clienteSel?.id === c.id}
                >
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.telefono}</TableCell>
                  <TableCell align="right">{(c.abonos || []).length}</TableCell>
                  <TableCell align="right">Q {Number(c.total_abonos || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {c.ultima_abono ? dayjs(c.ultima_abono).format('YYYY-MM-DD') : '—'}
                  </TableCell>
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

        <TableContainer component={Paper} sx={{ borderRadius: 3, flex: 1, minWidth: 420 }}>
          <Box
            sx={{
              p: 2,
              pb: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {clienteSel ? `Abonos de ${clienteSel.nombre}` : 'Selecciona un cliente'}
              </Typography>
              {clienteSel && (
                <Typography variant="body2" color="text.secondary">
                  {clienteSel.telefono} — Código: {clienteSel.codigo || '—'}
                </Typography>
              )}
            </Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha a consultar"
                value={fechaConsulta}
                onChange={(value) => setFechaConsulta(value || dayjs())}
                views={['year', 'month']}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
              />
            </LocalizationProvider>
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

          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell>Banco</TableCell>
                <TableCell>Nota</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {abonosClienteFiltrados.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.fecha || a.creado_en || '—'}</TableCell>
                  <TableCell>{a.referencia || '—'}</TableCell>
                  <TableCell>{a.banco || '—'}</TableCell>
                  <TableCell>{a.nota || '—'}</TableCell>
                  <TableCell align="right">Q {Number(a.monto || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {clienteSel && abonosClienteFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center" color="text.secondary">
                      Este cliente no tiene abonos
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  )
}
