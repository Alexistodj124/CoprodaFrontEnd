import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const toNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const initialForm = {
  nombre: '',
  codigo: '',
  costo_unitario: 0,
  stock_actual: '',
  stock_minimo: '',
  activo: true,
}

export default function MateriaPrimaNueva() {
  const navigate = useNavigate()
  const [form, setForm] = React.useState(initialForm)
  const [saving, setSaving] = React.useState(false)
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })

  const setField = (field) => (e) => {
    const value = field === 'activo' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nombre = form.nombre.trim()
    const codigo = form.codigo.trim()
    const costoUnitario = 0
    const stockActual = toNumber(form.stock_actual)
    const stockMinimo = toNumber(form.stock_minimo)

    if (!nombre || !codigo) {
      setSnack({ open: true, msg: 'Nombre y código son requeridos', severity: 'error' })
      return
    }
    if (stockActual == null || stockActual < 0 || stockMinimo == null || stockMinimo < 0) {
      setSnack({ open: true, msg: 'Stocks deben ser numéricos y >= 0', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/materias-primas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          codigo,
          costo_unitario: costoUnitario,
          stock_actual: stockActual,
          stock_minimo: stockMinimo,
          activo: Boolean(form.activo),
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo crear la materia prima'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || parsed.message || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      setSnack({ open: true, msg: 'Materia prima creada', severity: 'success' })
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'Error de red al crear materia prima', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 3, px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Materia prima
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/COPRODA/produccion-dashboard')}>
              Volver al panel
            </Button>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <input type="hidden" name="costo_unitario" value="0" />
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={setField('nombre')}
                required
                autoFocus
              />
              <TextField
                label="Código"
                value={form.codigo}
                onChange={setField('codigo')}
                required
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Stock actual"
                  type="number"
                  value={form.stock_actual}
                  onChange={setField('stock_actual')}
                  inputProps={{ min: 0, step: '1' }}
                  required
                  fullWidth
                />
                <TextField
                  label="Stock mínimo"
                  type="number"
                  value={form.stock_minimo}
                  onChange={setField('stock_minimo')}
                  inputProps={{ min: 0, step: '1' }}
                  required
                  fullWidth
                />
              </Stack>
              <FormControlLabel
                control={<Checkbox checked={Boolean(form.activo)} onChange={setField('activo')} />}
                label="Activo"
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="contained" type="submit" disabled={saving}>
                  Guardar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
