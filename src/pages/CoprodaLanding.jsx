import * as React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  GlobalStyles,
} from '@mui/material'
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined'
import logoCoproda from '../assets/logocoprodahome2.png'

const heroArt =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='#ffe6d5'/>
      <stop offset='0.5' stop-color='#ffd1b5'/>
      <stop offset='1' stop-color='#f8b4a0'/>
    </linearGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#g)'/>
  <circle cx='300' cy='220' r='180' fill='#f59e0b' opacity='0.25'/>
  <circle cx='1320' cy='160' r='220' fill='#fb7185' opacity='0.22'/>
  <path d='M0 620 C320 520 540 520 860 640 C1180 760 1360 760 1600 640 L1600 900 L0 900 Z' fill='#1f2937'/>
  <path d='M0 660 C320 560 540 560 860 680 C1180 800 1360 800 1600 680' stroke='#fff' stroke-width='12' opacity='0.5' fill='none'/>
</svg>
`)

const productArt = (accent, label) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 360'>
  <rect width='520' height='360' rx='30' fill='#ffffff'/>
  <rect x='0' y='0' width='520' height='90' fill='${accent}'/>
  <text x='28' y='58' font-size='34' font-family='Arial, sans-serif' fill='#ffffff' font-weight='700'>${label}</text>
  <rect x='36' y='126' width='448' height='190' rx='24' fill='#eef1f5'/>
  <circle cx='190' cy='220' r='52' fill='#d6dbe2'/>
  <circle cx='320' cy='220' r='64' fill='#c9cfd8'/>
</svg>
`)

const featuredSets = [
  { title: 'Linea de vajillas especializadas', pieces: 'Restaurantes y hoteles', tone: '#ef4444' },
  { title: 'Utensilios de uso domestico', pieces: 'Cocina diaria', tone: '#f97316' },
  { title: 'Utensilios de uso profesional', pieces: 'Mayoristas', tone: '#f59e0b' },
]

const productos = ['Sartenes', 'Ollas', 'Tapas', 'Cafeteras', 'Bandejas', 'Accesorios']
const servicios = ['Diseno personalizado', 'Mejora de rendimiento', 'Adaptacion de piezas', 'Alto volumen']

const highlights = [
  {
    title: 'Excelencia y durabilidad',
    copy:
      'Procesos de calidad que garantizan productos confiables y durables para el consumidor.',
    icon: <VerifiedOutlinedIcon />,
  },
  {
    title: 'Capacidad de produccion',
    copy:
      'Fabricacion de diversidad de disenos en aluminio con alto nivel de calidad.',
    icon: <WarehouseOutlinedIcon />,
  },
  {
    title: 'Cobertura y soporte',
    copy:
      'Apoyo de equipo de diseno y atencion a necesidades especificas del mercado.',
    icon: <LocalShippingOutlinedIcon />,
  },
]

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Empresa', href: '#empresa' },
  { label: 'Productos', href: '#productos' },
  { label: 'Capacidades', href: '#capacidades' },
  { label: 'Contacto', href: '#contacto' },
]

export default function CoprodaLanding() {
  return (
    <Box sx={{ bgcolor: '#f7f6f4', color: '#111827', minHeight: '100vh' }}>
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: '#f7f6f4',
            color: '#111827',
            fontFamily: '"Cabin", "Segoe UI", sans-serif',
          },
          h1: {
            fontFamily: '"Playfair Display", "Georgia", serif',
            letterSpacing: '0.01em',
          },
          h2: {
            fontFamily: '"Playfair Display", "Georgia", serif',
          },
        }}
      />

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 12,
          bgcolor: 'rgba(247,246,244,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e4e7ec',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Box component="img" src={logoCoproda} alt="Coproda" sx={{ height: 48 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ef4444' }}>
                COPRODA, S.A.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  href={item.href}
                  sx={{
                    color: '#1f2937',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    '&:hover': { color: '#ef4444' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                href="#contacto"
                sx={{
                  bgcolor: '#111827',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 999,
                  px: 3,
                  '&:hover': { bgcolor: '#1f2937' },
                }}
              >
                Cotizar
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box id="inicio" sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg, rgba(247,246,244,0.9), rgba(247,246,244,0.2))',
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Typography variant="overline" sx={{ letterSpacing: '0.4em', color: '#ef4444' }}>
                  COMPANIA PROCESADORA DE ALUMINIO
                </Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 72 }, lineHeight: 1.02 }}>
                  Aluminio con diseno, durabilidad y presencia.
                </Typography>
                <Typography variant="h6" sx={{ color: '#4b5563', maxWidth: 520 }}>
                  Fabricamos utensilios de cocina de aluminio con procesos de calidad para hogares y negocios.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    href="#productos"
                    sx={{
                      bgcolor: '#ef4444',
                      color: 'white',
                      px: 4,
                      py: 1.4,
                      textTransform: 'none',
                      borderRadius: 999,
                      boxShadow: '0 22px 40px rgba(239,68,68,0.3)',
                      '&:hover': { bgcolor: '#dc2626' },
                    }}
                  >
                    Ver catalogo
                  </Button>
                  <Button
                    variant="outlined"
                    href="#empresa"
                    sx={{
                      borderColor: '#111827',
                      color: '#111827',
                      px: 4,
                      py: 1.4,
                      textTransform: 'none',
                      borderRadius: 999,
                    }}
                  >
                    Nuestra empresa
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 5,
                  bgcolor: 'white',
                  boxShadow: '0 28px 60px rgba(17,24,39,0.2)',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Datos clave
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4b5563' }}>
                      Fundacion: 20 de febrero de 2009. Giro: fabricacion de utensilios de cocina en aluminio.
                    </Typography>
                    <Divider />
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip label="Excelencia" />
                      <Chip label="Durabilidad" />
                      <Chip label="Calidad" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="empresa" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#111827' }}>
        <Container maxWidth="xl">
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 42 }, color: 'white' }}>
              Sobre la empresa
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 760 }}>
              Coproda, S.A. es la Compania Procesadora de Aluminio en Guatemala, dedicada a la fabricacion
              de utensilios de cocina con procesos de calidad que garantizan productos durables y confiables.
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {highlights.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ color: '#f59e0b' }}>{item.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                        {item.copy}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="productos" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f7f6f4' }}>
        <Container maxWidth="xl">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.4em', color: '#ef4444' }}>
              CATALOGO
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
              Productos de aluminio
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {featuredSets.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(17,24,39,0.12)',
                  }}
                >
                  <Box
                    component="img"
                    src={productArt(item.tone, 'COPRODA')}
                    alt={item.title}
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      {item.pieces}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Utensilios domesticos y profesionales
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                    Lineas para cocina diaria y servicio profesional, con variedad de formas y aplicaciones.
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {productos.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'white' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Vajillas especializadas
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
                    Linea de vajillas para restaurantes u hoteles con disenos funcionales.
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label="Restaurantes" />
                    <Chip label="Hoteles" />
                    <Chip label="Eventos" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="capacidades" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#111827' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, color: 'white', mb: 2 }}>
                Capacidades de produccion
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
                Capacidad para fabricar diversidad de disenos y atender necesidades especificas del mercado.
              </Typography>
              <Stack spacing={2}>
                {servicios.map((item) => (
                  <Stack key={item} direction="row" spacing={2} alignItems="center">
                    <DesignServicesOutlinedIcon sx={{ color: '#f59e0b' }} />
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 5,
                  bgcolor: 'white',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Lo que hacemos
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VerifiedOutlinedIcon sx={{ color: '#ef4444' }} />
                      <Typography variant="body2">
                        Disenar y fabricar utensilios con variedad de formas y aplicaciones.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VerifiedOutlinedIcon sx={{ color: '#ef4444' }} />
                      <Typography variant="body2">
                        Procesos de calidad que aseguran durabilidad y rendimiento.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VerifiedOutlinedIcon sx={{ color: '#ef4444' }} />
                      <Typography variant="body2">
                        Apoyo de diseno para adaptar o desarrollar piezas personalizadas.
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="contacto" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f7f6f4' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, mb: 2 }}>
                Contacto
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', mb: 3 }}>
                Visitanos o escribenos para solicitudes de catalogo, precios y distribucion.
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneInTalkIcon sx={{ color: '#ef4444' }} />
                  <Typography variant="body1">(502) 2448-9079</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <MailOutlineIcon sx={{ color: '#ef4444' }} />
                  <Typography variant="body1">info@coproda.com.gt</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PlaceOutlinedIcon sx={{ color: '#ef4444' }} />
                  <Typography variant="body1">
                    4a Avenida 3-19, Zona 1, Boca del Monte, Guatemala
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 5,
                  bgcolor: '#111827',
                  color: 'white',
                  boxShadow: '0 30px 60px rgba(17,24,39,0.3)',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Listos para tu proyecto
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
                    Solicita catalogos, precios y opciones de distribucion con nuestro equipo.
                  </Typography>
                  <Button
                    variant="contained"
                    href="#productos"
                    sx={{
                      bgcolor: '#ef4444',
                      color: 'white',
                      textTransform: 'none',
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      '&:hover': { bgcolor: '#dc2626' },
                    }}
                  >
                    Explorar catalogo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: '#111827', color: 'white' }}>
        <Typography variant="body2" sx={{ opacity: 0.65 }}>
          Coproda S.A. - Compañia Procesadora de Aluminio.
        </Typography>
      </Box>
    </Box>
  )
}
