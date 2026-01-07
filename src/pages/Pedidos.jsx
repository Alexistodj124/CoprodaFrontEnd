import * as React from 'react'
import {
  Box, Paper, Typography, Stack, Divider, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, MenuItem, InputAdornment, IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { API_BASE_URL } from '../config/api'
import logoCoproda from '../assets/image.png'
import { NumerosALetras } from 'numero-a-letras'
dayjs.extend(isBetween)

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
const formatTotalEnLetras = (value) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return NumerosALetras(num)
    .replace('Pesos', 'Quetzales')
    .replace('Peso', 'Quetzal')
    .replace('/100 M.N.', '/100')
}

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

export default function Reportes() {
  const [ordenSel, setOrdenSel] = React.useState(null)
  const [ordenes, setOrdenes] = React.useState([])
  const [productosById, setProductosById] = React.useState({})
  const [clientesById, setClientesById] = React.useState({})
  const [tiposPago, setTiposPago] = React.useState([])
    const [range, setRange] = React.useState([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ])
  const [deletingId, setDeletingId] = React.useState(null)
  const [confirmadas, setConfirmadas] = React.useState({})

  const filtered = React.useMemo(() => {
  // usa SOLO backend
    const source = ordenes
  
    // si no hay empleada seleccionada, devuelve todas  
    return source
  }, [ordenes])


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

  const cargarTiposPago = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tipos_pago`)
      if (!res.ok) throw new Error('Error al obtener tipos de pago')
      const data = await res.json()
      setTiposPago(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const restockOrden = async (orden) => {
    if (!orden?.items?.length) return

    // Para cada item, sumamos la cantidad vendida de vuelta al stock del producto
    for (const it of orden.items) {
      const productoId = it.producto_id ?? it.producto?.id
      if (!productoId) continue

      const qty = getItemQty(it)
      // Obtener stock actual desde backend para evitar usar valores viejos del item
      const getRes = await fetch(`${API_BASE_URL}/productos/${productoId}`)
      if (!getRes.ok) {
        const msg = await getRes.text()
        throw new Error(msg || `No se pudo leer stock del producto ${productoId}`)
      }
      const productoActual = await getRes.json()
      const cantidadActual = Number(productoActual?.cantidad ?? 0)
      const stockActual = Number.isFinite(cantidadActual) ? cantidadActual : 0
      const nuevaCantidad = stockActual + qty

      const putRes = await fetch(`${API_BASE_URL}/productos/${productoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      })

      if (!putRes.ok) {
        const msg = await putRes.text()
        throw new Error(msg || `Error al devolver inventario del producto ${productoId}`)
      }
    }
  }

  const handleDeleteOrden = async (orden) => {
    const id = orden?.id
    if (!id) return
    const confirmed = window.confirm('¿Eliminar esta orden?')
    if (!confirmed) return

    try {
      setDeletingId(id)
      await restockOrden(orden)

      const res = await fetch(`${API_BASE_URL}/ordenes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar orden')
      setOrdenes((prev) => prev.filter((o) => o.id !== id))
      if (ordenSel?.id === id) setOrdenSel(null)
    } catch (err) {
      alert('No se pudo eliminar la orden o devolver inventario. Revisa la consola.')
      console.error(err)
    } finally {
      setDeletingId(null)
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

  const descuentoOrdenSel = getOrdenDescuento(ordenSel)
  const subtotalOrdenSel = calcSubtotal(ordenSel?.items || [])
  const totalOrdenSel = calcTotal(ordenSel?.items || [], descuentoOrdenSel)
  const ordenEstaConfirmada = ordenSel ? !!confirmadas[ordenSel.id] : false

  const handleConfirmOrden = () => {
    if (!ordenSel?.id) return
    setConfirmadas(prev => ({ ...prev, [ordenSel.id]: true }))
  }

  const handlePrintOrden = () => {
    if (!ordenSel) return

    const fmtDate = (d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '')
    const addDaysToDate = (dateValue, days) => {
      if (!dateValue || !Number.isFinite(days)) return ''
      return dayjs(dateValue).add(days, 'day').format('DD/MM/YYYY')
    }
    const numberFmt = (n) => `Q ${Number(n || 0).toFixed(2)}`
    const itemsRows = (ordenSel.items || []).map((it) => {
      const productoInfo = it.producto ?? productosById[it.producto_id]
      const nombre =
        productoInfo?.nombre ||
        it.servicio?.nombre ||
        it.nombre ||
        `Item #${it.id}`
      const sku = productoInfo?.codigo || it.codigo || ''
      const price = getItemPrice(it)
      const qty = getItemQty(it)
      const subtotal = price * qty
      return `
        <tr>
          <td class="center">${qty || ''}</td>
          <td class="center">${sku || ''}</td>
          <td>${nombre}</td>
          <td class="center">${numberFmt(price)}</td>
          <td class="center">${numberFmt(subtotal)}</td>
        </tr>
      `
    }).join('')

    const copyTypes = ['CONTABILIDAD']
    const fechaTexto = fmtDate(ordenSel.fecha)
    const codigo = ordenSel.codigo ?? ordenSel.id ?? ''
    const clienteInfo = ordenSel.cliente ?? clientesById[ordenSel.cliente_id]
    const clienteNombre = clienteInfo?.nombre ?? ''
    const clienteTel = clienteInfo?.telefono ?? ''
    const clienteDir = clienteInfo?.direccion ?? ''
    const tipoPagoKey = ordenSel.tipo_pago_id != null ? String(ordenSel.tipo_pago_id) : ''
    let tipoPagoSeleccionado = null
    for (const tipo of tiposPago) {
      if (String(tipo?.id) === tipoPagoKey) {
        tipoPagoSeleccionado = tipo
        break
      }
    }
    const pagoNombre =
      tipoPagoSeleccionado?.nombre ||
      ordenSel.forma_pago ||
      ordenSel.metodo_pago ||
      ordenSel.pago ||
      ordenSel.tipo_pago_id ||
      ''
    const pago = pagoNombre.toString().toUpperCase()
    const totalEnLetras = formatTotalEnLetras(totalOrdenSel)
    const pagoNombreLower = pagoNombre.toString().toLowerCase()
    let vencimiento = ''
    if (pagoNombreLower.includes('credito')) {
      const firstToken = pagoNombreLower.trim().split(/\s+/)[0]
      const diasCredito = Number(firstToken)
      if (Number.isFinite(diasCredito) && diasCredito > 0) {
        vencimiento = addDaysToDate(ordenSel.fecha, diasCredito)
      }
    }

    const copiesHtml = copyTypes.map((tipo) => `
      <div class="hoja">
        <div class="watermark">
          <img src="${logoCoproda}" alt="Coproda" />
        </div>
        <div class="encabezado">
          <div class="empresa">
            <div class="title">COMPAÑÍA PROCESADORA DE ALUMINIO, S.A.</div>
            <div class="sub">
              ALUMINIO DE CALIDAD QUE PERDURA<br/>
              PRODUCTO CENTROAMERICANO HECHO EN GUATEMALA<br/>
              KM. 32 CARRETERA AL SALVADOR, FRACCIÓN 8, SAN JOSÉ EL CHORO, PROYECTO INDUSTRIAL EL ALTO, VILLA CANALES<br/>
              TELEFONO: 5852-8466
            </div>
          </div>
          <div class="caja">
            <div class="label">ENVIO NO.</div>
            <div class="valor">${codigo}</div>
            <div class="label" style="margin-top:4px;">FECHA:</div>
            <div class="valor">${fechaTexto}</div>
          </div>
        </div>

        <div class="folio">
          <span>CODIGO:</span>
          <span class="valor">${codigo}</span>
          <span class="copy">${tipo}</span>
        </div>

        <div class="cliente">
          <div><strong>CLIENTE:</strong> ${clienteNombre}</div>
          <div><strong>DIRECCION:</strong> ${clienteDir || '______________________________'}</div>
          <div><strong>TELEFONO:</strong> ${clienteTel || '________________'}</div>
        </div>

        <div class="datos">
          <div><strong>NIT:</strong> __________</div>
          <div><strong>PAGO:</strong> ${pago}</div>
          <div><strong>VENCIMIENTO:</strong> ${vencimiento || '__________'}</div>
        </div>

        <table class="tabla">
          <thead>
            <tr>
              <th width="10%">CANTIDAD</th>
              <th width="15%">COD.PROD.</th>
              <th>DESCRIPCION</th>
              <th width="15%">P/UNITARIO</th>
              <th width="15%">SUB-TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="5" class="center">Sin items</td></tr>'}
          </tbody>
        </table>

        <div class="totales">
          <div>TOTAL EN LETRAS: ${totalEnLetras || '_______________________________'}</div>
          <div class="total-box">
            <span>TOTAL</span>
            <span class="cantidad">${numberFmt(totalOrdenSel)}</span>
          </div>
        </div>

        <div class="firmas">
          <div class="firma">
            <div class="firma-linea"></div>
            <div>FIRMA DEPTO. VENTAS:</div>
          </div>
          <div class="firma">
            <div class="firma-linea"></div>
            <div>FIRMA ACEPTACION CLIENTE:</div>
          </div>
        </div>
      </div>
    `).join('')

    const html = `
      <html>
        <head>
          <title>Orden ${codigo}</title>
          <style>
            @page { margin: 15mm; }
            body { font-family: 'Times New Roman', serif; font-size: 12px; margin: 0; }
            *, *::before, *::after { box-sizing: border-box; }
            .watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0.08;
              pointer-events: none;
              z-index: 0;
            }
            .watermark img {
              width: 100%;
              max-width: 1000px;
              height: auto;
              filter: grayscale(100%);
            }
            .hoja {
              border: 1px solid #222;
              padding: 10px 12px 14px;
              margin-bottom: 16px;
              page-break-inside: avoid;
              position: relative;
              width: calc(100% - 2px);
            }
            .encabezado { display: grid; grid-template-columns: 1fr 150px; gap: 8px; align-items: center; }
            .empresa .title { font-weight: 900; text-align: center; font-size: 14px; }
            .empresa .sub { text-align: center; font-size: 10px; line-height: 1.3; margin-top: 2px; }
            .caja { border: 1px solid #000; padding: 6px; font-size: 11px; }
            .caja .label { font-weight: 700; }
            .caja .valor { border: 1px solid #000; padding: 3px 4px; text-align: center; margin-top: 2px; }
            .folio { display: flex; align-items: center; gap: 8px; margin: 10px 0 6px; font-weight: 700; }
            .folio .valor { padding: 2px 6px; border: 1px solid #000; }
            .folio .copy { margin-left: auto; padding: 4px 12px; border: 1px solid #c00; font-size: 14px; font-weight: 900; }
            .cliente { display: grid; grid-template-columns: 1fr; row-gap: 4px; margin-bottom: 8px; }
            .datos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px; font-weight: 700; }
            .tabla { width: 100%; border-collapse: collapse; font-size: 12px; }
            .tabla th, .tabla td { border: 1px solid #000; padding: 6px 5px; }
            .tabla th { text-align: center; font-weight: 700; }
            .center { text-align: center; }
            .totales { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
            .total-box { display: flex; align-items: center; gap: 10px; border: 1px solid #000; padding: 6px 10px; font-weight: 900; }
            .cantidad { font-size: 16px; }
            .firmas { display: flex; justify-content: space-between; margin-top: 20px; font-weight: 700; gap: 20px; }
            .firma { flex: 1; }
            .firma-linea { border-top: 1px solid #000; margin: 65px 0 6px; }
          </style>
        </head>
        <body>
          ${copiesHtml}
        </body>
      </html>
    `

    const w = window.open('', '_blank', 'width=400,height=600')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

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
    cargarTiposPago()
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Pedidos
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

            <Chip
              label={`Total en el período: Q ${totalPeriodo.toFixed(2)}`}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`Ganancia en el periodo: Q ${gananciaPeriodo.toFixed(2)}`}
              color="success"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>No. Orden</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((o) => {
                const clienteInfo = o.cliente ?? clientesById[o.cliente_id]
                const tipoPagoKey = o.tipo_pago_id != null ? String(o.tipo_pago_id) : ''
                let tipoPagoNombre = ''
                for (const tipo of tiposPago) {
                  if (String(tipo?.id) === tipoPagoKey) {
                    tipoPagoNombre = tipo?.nombre || ''
                    break
                  }
                }
                return (
                  <TableRow
                    key={o.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setOrdenSel(o)}
                  >
                    <TableCell>{dayjs(o.fecha).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>{o.codigo ?? o.id}</TableCell>
                    <TableCell>{clienteInfo?.nombre || '-'}</TableCell>
                    <TableCell>{tipoPagoNombre || '-'}</TableCell>
                    <TableCell align="right">
                      Q {calcTotal(o.items || [], getOrdenDescuento(o)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
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

        {/* -------- Dialog Detalle de Orden -------- */}
        <Dialog open={!!ordenSel} onClose={() => setOrdenSel(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Orden {ordenSel?.id}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha: {ordenSel ? dayjs(ordenSel.fecha).format('YYYY-MM-DD HH:mm') : '--'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: {(ordenSel?.cliente ?? clientesById[ordenSel?.cliente_id])?.nombre || '-'} — {(ordenSel?.cliente ?? clientesById[ordenSel?.cliente_id])?.telefono || '-'}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Cant.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenSel?.items?.map((it) => {
                  const productoInfo = it.producto ?? productosById[it.producto_id]
                  let nombre = ''
                  if (it.tipo === 'servicio') {
                    nombre =
                      it.servicio?.descripcion ||
                      it.nombre ||
                      `Servicio #${it.servicio_id ?? it.id}`
                  } else { // asumimos 'producto'
                    nombre =
                      productoInfo?.nombre ||
                      productoInfo?.descripcion ||
                      it.nombre ||
                      `Producto #${it.producto_id ?? it.id}`
                  }

                  // 🔹 SKU según tipo
                  let sku = productoInfo?.codigo || it.codigo || ''

                  const price =
                    getItemPrice(it) ||
                    it.servicio?.precio ||
                    0

                  const qty = getItemQty(it)

                  return (
                    <TableRow key={it.id}>
                      <TableCell>{nombre}</TableCell>
                      <TableCell>{sku}</TableCell>
                      <TableCell align="right">Q {price.toFixed(2)}</TableCell>
                      <TableCell align="right">{qty}</TableCell>
                      <TableCell align="right">Q {(price * qty).toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}


                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                    Subtotal
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Q {subtotalOrdenSel.toFixed(2)}
                  </TableCell>
                </TableRow>
                {descuentoOrdenSel > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
                      Descuento
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      -Q {descuentoOrdenSel.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Q {totalOrdenSel.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            {ordenSel && (
              <>
                <Button
                  variant="contained"
                  color={ordenEstaConfirmada ? 'success' : 'primary'}
                  onClick={handleConfirmOrden}
                  disabled={ordenEstaConfirmada}
                >
                  {ordenEstaConfirmada ? 'Confirmado' : 'Confirmar'}
                </Button>
                {ordenEstaConfirmada && (
                  <Button variant="outlined" onClick={handlePrintOrden}>
                    Imprimir
                  </Button>
                )}
              </>
            )}
            {ordenSel && (
              <Button
                color="error"
                onClick={() => handleDeleteOrden(ordenSel)}
                disabled={deletingId === ordenSel.id}
              >
                Eliminar
              </Button>
            )}
            <Button onClick={() => setOrdenSel(null)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}
