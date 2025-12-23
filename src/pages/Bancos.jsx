import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material'

const seedPagos = [
  { id: 'mock-1', fecha: '2024-10-01', referencia: 'DEP-001', banco: 'BANTRAB', monto: 150.0, nota: 'Deposito en ventanilla', asignado: false },
  { id: 'mock-2', fecha: '2024-10-05', referencia: 'TRF-842', banco: 'BAC', monto: 320.5, nota: 'Transferencia cliente contado', asignado: true },
  { id: 'mock-3', fecha: '2024-10-12', referencia: 'CHK-554', banco: 'G&T', monto: 80.0, nota: 'Cheque', asignado: false },
]

export default function Bancos() {
  const [pagos, setPagos] = React.useState(seedPagos)
  const [filtroAsignado, setFiltroAsignado] = React.useState('todos')
  const [form, setForm] = React.useState({
    fecha: new Date().toISOString().slice(0, 10),
    referencia: '',
    banco: '',
    monto: '',
    nota: '',
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleAddPago = () => {
    if (!form.referencia.trim() || !form.monto) return
    const nuevo = {
      id: `local-${Date.now()}`,
      fecha: form.fecha || new Date().toISOString().slice(0, 10),
      referencia: form.referencia.trim(),
      banco: form.banco.trim(),
      monto: Number(form.monto) || 0,
      nota: form.nota.trim(),
      asignado: false,
    }
    setPagos((prev) => [nuevo, ...prev])
    setForm((prev) => ({
      ...prev,
      referencia: '',
      banco: '',
      monto: '',
      nota: '',
    }))
  }

  const pagosFiltrados = React.useMemo(() => {
    if (filtroAsignado === 'asignado') {
      return pagos.filter((p) => p.asignado)
    }
    if (filtroAsignado === 'no-asignado') {
      return pagos.filter((p) => !p.asignado)
    }
    return pagos
  }, [pagos, filtroAsignado])

  const total = pagosFiltrados.reduce((s, p) => s + (Number(p.monto) || 0), 0)

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Bancos — Pagos
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Registrar pago
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
          <TextField
            label="Fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange('fecha')}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Referencia"
            value={form.referencia}
            onChange={handleChange('referencia')}
            sx={{ minWidth: 180 }}
            required
          />
          <TextField
            label="Banco"
            value={form.banco}
            onChange={handleChange('banco')}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="Monto (Q)"
            type="number"
            value={form.monto}
            onChange={handleChange('monto')}
            sx={{ minWidth: 140 }}
            inputProps={{ min: 0, step: '0.01' }}
            required
          />
          <TextField
            label="Nota"
            value={form.nota}
            onChange={handleChange('nota')}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleAddPago}
            disabled={!form.referencia.trim() || !form.monto}
          >
            Guardar pago
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Todos los pagos
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Filtro"
              value={filtroAsignado}
              onChange={(e) => setFiltroAsignado(e.target.value)}
              size="small"
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="asignado">Asignado</MenuItem>
              <MenuItem value="no-asignado">No asignado</MenuItem>
            </TextField>
            <Typography variant="subtitle2" color="text.secondary">
              Total: Q {total.toFixed(2)}
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell>Asignado</TableCell>
              <TableCell align="right">Monto (Q)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map((p) => (
              <TableRow
                key={p.id}
                sx={{
                  backgroundColor: p.asignado ? '#dff4e4' : '#f9dede',
                  color: 'text.primary',
                }}
              >
                <TableCell>{p.fecha}</TableCell>
                <TableCell>{p.referencia}</TableCell>
                <TableCell>{p.banco || '—'}</TableCell>
                <TableCell>{p.nota || '—'}</TableCell>
                <TableCell
                  sx={{
                    color: p.asignado ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {p.asignado ? 'Si' : 'No'}
                </TableCell>
                <TableCell align="right">Q {(Number(p.monto) || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {pagosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography align="center" color="text.secondary">
                    No hay pagos registrados.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
