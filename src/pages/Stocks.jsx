import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { useLocation } from 'react-router-dom'
import RefreshIcon from '@mui/icons-material/Refresh'
import { API_BASE_URL } from '../config/api'

const TABS = [
  { id: 'finales', label: 'Productos finales' },
  { id: 'componentes', label: 'Producto Agranel' },
  { id: 'materias', label: 'Materias primas' },
]

const toNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export default function Stocks() {
  const location = useLocation()
  const [tab, setTab] = React.useState('finales')
  const [productos, setProductos] = React.useState([])
  const [materiasPrimas, setMateriasPrimas] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [snack, setSnack] = React.useState({ open: false, msg: '', severity: 'success' })

  const [editProductos, setEditProductos] = React.useState({})
  const [editMaterias, setEditMaterias] = React.useState({})

  const [ajusteDialog, setAjusteDialog] = React.useState({
    open: false,
    materia: null,
    tipo: 'ENTRADA',
    cantidad: '',
    motivo: '',
    observaciones: '',
  })

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const requestedTab = params.get('tab')
    if (requestedTab && TABS.some((t) => t.id === requestedTab)) {
      setTab(requestedTab)
    }
  }, [location.search])

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/productos`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      setProductos(data || [])
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'No se pudieron cargar productos', severity: 'error' })
    }
  }

  const cargarMateriasPrimas = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/materias-primas`)
      if (!res.ok) throw new Error('Error al obtener materias primas')
      const data = await res.json()
      setMateriasPrimas(data || [])
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'No se pudieron cargar materias primas', severity: 'error' })
    }
  }

  const recargarTodo = async () => {
    setLoading(true)
    await Promise.all([cargarProductos(), cargarMateriasPrimas()])
    setLoading(false)
  }

  React.useEffect(() => {
    recargarTodo()
  }, [])

  const productosFinales = productos.filter((p) => p?.es_producto_final)
  const productosComponentes = productos.filter((p) => p?.es_producto_final === false)

  const handleGuardarProducto = async (producto) => {
    const edits = editProductos[producto.id] || {}
    const stockActual = toNumber(edits.stock_actual ?? producto.stock_actual)
    const stockMinimo = toNumber(edits.stock_minimo ?? producto.stock_minimo)

    if (stockActual == null || stockMinimo == null) {
      setSnack({ open: true, msg: 'Stock actual y mínimo deben ser numéricos', severity: 'error' })
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/productos/${producto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_actual: stockActual, stock_minimo: stockMinimo }),
      })

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo actualizar el stock'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      setSnack({ open: true, msg: 'Stock actualizado', severity: 'success' })
      await cargarProductos()
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'Error de red al actualizar stock', severity: 'error' })
    }
  }

  const handleGuardarMinimoMateria = async (materia) => {
    const edits = editMaterias[materia.id] || {}
    const stockMinimo = toNumber(edits.stock_minimo ?? materia.stock_minimo)

    if (stockMinimo == null) {
      setSnack({ open: true, msg: 'Stock mínimo debe ser numérico', severity: 'error' })
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/materias-primas/${materia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_minimo: stockMinimo }),
      })

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo actualizar el stock mínimo'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      setSnack({ open: true, msg: 'Stock mínimo actualizado', severity: 'success' })
      await cargarMateriasPrimas()
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'Error de red al actualizar stock mínimo', severity: 'error' })
    }
  }

  const handleOpenAjuste = (materia) => {
    setAjusteDialog({
      open: true,
      materia,
      tipo: 'ENTRADA',
      cantidad: '',
      motivo: '',
      observaciones: '',
    })
  }

  const handleCloseAjuste = () => {
    setAjusteDialog((prev) => ({ ...prev, open: false }))
  }

  const handleGuardarAjuste = async () => {
    if (!ajusteDialog?.materia?.id) return
    const cantidad = toNumber(ajusteDialog.cantidad)
    if (cantidad == null) {
      setSnack({ open: true, msg: 'Cantidad debe ser numérica', severity: 'error' })
      return
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/materias-primas/${ajusteDialog.materia.id}/ajustes-stock`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: ajusteDialog.tipo,
            cantidad,
            motivo: ajusteDialog.motivo || null,
            observaciones: ajusteDialog.observaciones || null,
          }),
        }
      )

      if (!res.ok) {
        const txt = await res.text()
        let msg = 'No se pudo registrar el ajuste'
        try {
          const parsed = JSON.parse(txt)
          msg = parsed.error || msg
        } catch (_) {
          // noop
        }
        setSnack({ open: true, msg, severity: 'error' })
        return
      }

      setSnack({ open: true, msg: 'Ajuste registrado', severity: 'success' })
      handleCloseAjuste()
      await cargarMateriasPrimas()
    } catch (err) {
      console.error(err)
      setSnack({ open: true, msg: 'Error de red al registrar ajuste', severity: 'error' })
    }
  }

  const renderTablaProductos = (items) => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Stock actual</TableCell>
            <TableCell>Stock reservado</TableCell>
            <TableCell>Stock mínimo</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  No hay registros.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.codigo ?? '—'}</TableCell>
                <TableCell>{item.nombre ?? '—'}</TableCell>
                <TableCell sx={{ width: 140 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={editProductos[item.id]?.stock_actual ?? item.stock_actual ?? ''}
                    onChange={(e) =>
                      setEditProductos((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], stock_actual: e.target.value },
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>{item.stock_reservado ?? 0}</TableCell>
                <TableCell sx={{ width: 140 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={editProductos[item.id]?.stock_minimo ?? item.stock_minimo ?? ''}
                    onChange={(e) =>
                      setEditProductos((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], stock_minimo: e.target.value },
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>{item.activo === false ? 'No' : 'Sí'}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => handleGuardarProducto(item)}>
                    Guardar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderTablaMaterias = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Stock actual</TableCell>
            <TableCell>Stock reservado</TableCell>
            <TableCell>Stock mínimo</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {materiasPrimas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  No hay materias primas.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            materiasPrimas.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.codigo ?? '—'}</TableCell>
                <TableCell>{item.nombre ?? '—'}</TableCell>
                <TableCell>{item.stock_actual ?? 0}</TableCell>
                <TableCell>{item.stock_reservado ?? 0}</TableCell>
                <TableCell sx={{ width: 140 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={editMaterias[item.id]?.stock_minimo ?? item.stock_minimo ?? ''}
                    onChange={(e) =>
                      setEditMaterias((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], stock_minimo: e.target.value },
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>{item.activo === false ? 'No' : 'Sí'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="text" onClick={() => handleOpenAjuste(item)}>
                      Ajustar
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => handleGuardarMinimoMateria(item)}>
                      Guardar mínimo
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, px: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Stocks
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={recargarTodo}
            disabled={loading}
          >
            Recargar
          </Button>
        </Stack>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            {TABS.map((item) => (
              <Tab key={item.id} value={item.id} label={item.label} />
            ))}
          </Tabs>

          {tab === 'finales' && renderTablaProductos(productosFinales)}
          {tab === 'componentes' && renderTablaProductos(productosComponentes)}
          {tab === 'materias' && renderTablaMaterias()}
        </Paper>
      </Stack>

      <Dialog open={ajusteDialog.open} onClose={handleCloseAjuste} fullWidth maxWidth="sm">
        <DialogTitle>Ajuste de stock</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Materia prima"
            value={ajusteDialog.materia?.nombre ?? ''}
            disabled
          />
          <TextField
            select
            label="Tipo"
            value={ajusteDialog.tipo}
            onChange={(e) => setAjusteDialog((prev) => ({ ...prev, tipo: e.target.value }))}
          >
            <MenuItem value="ENTRADA">Entrada</MenuItem>
            <MenuItem value="SALIDA">Salida</MenuItem>
            <MenuItem value="AJUSTE">Ajuste</MenuItem>
          </TextField>
          <TextField
            label="Cantidad"
            type="number"
            value={ajusteDialog.cantidad}
            onChange={(e) => setAjusteDialog((prev) => ({ ...prev, cantidad: e.target.value }))}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Motivo (opcional)"
            value={ajusteDialog.motivo}
            onChange={(e) => setAjusteDialog((prev) => ({ ...prev, motivo: e.target.value }))}
          />
          <TextField
            label="Observaciones (opcional)"
            value={ajusteDialog.observaciones}
            onChange={(e) => setAjusteDialog((prev) => ({ ...prev, observaciones: e.target.value }))}
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAjuste}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarAjuste}>
            Guardar ajuste
          </Button>
        </DialogActions>
      </Dialog>

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
