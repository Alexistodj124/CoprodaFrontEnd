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

const initialForm = {
  nombre: '',
  descripcion: '',
  activo: true,
}

export default function ProcesoNuevo() {
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
    const descripcion = form.descripcion.trim()

    if (!nombre) {
      setSnack({ open: true, msg: 'El nombre es requerido', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/procesos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion: descripcion ? descripcion : null,
          activo: Boolean(form.activo),
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo crear el proceso'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || parsed.message || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      setSnack({ open: true, msg: 'Proceso creado', severity: 'success' })
      setForm(initialForm)
      navigate('/COPRODA/produccion-procesos?tipo=producto')
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'Error de red al crear proceso', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 3, px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Nuevo proceso
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/COPRODA/produccion-dashboard')}>
              Volver al panel
            </Button>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Nombre"
                value={form.nombre}
                onChange={setField('nombre')}
                required
                autoFocus
              />
              <TextField
                label="Descripción (opcional)"
                value={form.descripcion}
                onChange={setField('descripcion')}
                multiline
                minRows={2}
              />
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
