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
import FacebookIcon from '@mui/icons-material/Facebook'
import logoCoproda from '../assets/logocoprodahome2.png'

const heroImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1400 720'>
  <defs>
    <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='#6b6b6b'/>
      <stop offset='1' stop-color='#8a8a8a'/>
    </linearGradient>
    <filter id='blur' x='-20%' y='-20%' width='140%' height='140%'>
      <feGaussianBlur stdDeviation='14'/>
    </filter>
  </defs>
  <rect width='1400' height='720' fill='url(#g)'/>
  <polygon points='0,0 420,0 0,340' fill='#8c1d18'/>
  <polygon points='1400,720 980,720 1400,360' fill='#8c1d18'/>
  <g filter='url(#blur)' opacity='0.45'>
    <circle cx='520' cy='400' r='160' fill='#1f1f1f'/>
    <circle cx='900' cy='420' r='140' fill='#1f1f1f'/>
  </g>
  <g opacity='0.3' stroke='#dadada' stroke-width='22' fill='none'>
    <path d='M420 420 C500 320 640 320 720 420'/>
    <path d='M780 440 C860 350 1000 350 1080 440'/>
  </g>
</svg>
`)

const productArt = (accent, label) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 360'>
  <defs>
    <linearGradient id='r' x1='0' x2='1'>
      <stop offset='0' stop-color='${accent}'/>
      <stop offset='1' stop-color='#7a1b1b'/>
    </linearGradient>
  </defs>
  <rect width='520' height='360' rx='22' fill='#f7f7f7'/>
  <rect x='0' y='0' width='520' height='86' fill='url(#r)'/>
  <text x='36' y='58' font-size='34' font-family='Arial, sans-serif' fill='#ffffff' font-weight='700'>${label}</text>
  <rect x='40' y='120' width='440' height='200' rx='22' fill='#d9d9d9'/>
  <circle cx='190' cy='210' r='52' fill='#bdbdbd'/>
  <circle cx='320' cy='210' r='64' fill='#c6c6c6'/>
</svg>
`)

const featuredSets = [
  { title: 'Vajilla Monja Blanca', pieces: '3 piezas', tone: '#b5221c' },
  { title: 'Vajilla Orquidea', pieces: '10 piezas', tone: '#bb1e1e' },
  { title: 'Vajilla Trebol', pieces: '4 piezas', tone: '#a01f1f' },
]

const vajillas = ['Monja Blanca', 'Conicas', 'Orquidea', 'Restaurante']
const otrosProductos = ['Lecheros', 'Palanganas', 'Arroceras', 'Tinas']

const highlights = [
  {
    title: 'Tradicion y confianza',
    copy:
      'Coproda S.A. mantiene una trayectoria guatemalteca enfocada en calidad y permanencia.',
  },
  {
    title: 'Aluminio que dura',
    copy:
      'Productos con larga vida util, resistencia y estilos que combinan lo tradicional con lo moderno.',
  },
  {
    title: 'Cobertura regional',
    copy:
      'Distribucion y venta mayorista en Guatemala y el mercado centroamericano.',
  },
]

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nuestra empresa', href: '#empresa' },
  { label: 'Productos', href: '#productos' },
  { label: 'Contactenos', href: '#contacto' },
]

export default function CoprodaLanding() {
  return (
    <Box sx={{ bgcolor: '#f3f4f6', color: '#101418', minHeight: '100vh' }}>
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: '#f3f4f6',
            color: '#101418',
            fontFamily: '"Barlow Condensed", "Montserrat", "Segoe UI", sans-serif',
          },
          h1: {
            fontFamily: '"Bebas Neue", "Barlow Condensed", sans-serif',
            letterSpacing: '0.02em',
          },
          h2: {
            fontFamily: '"Barlow Condensed", "Montserrat", sans-serif',
            letterSpacing: '0.02em',
          },
        }}
      />

      <Box sx={{ bgcolor: '#2b2b2b', color: 'white', py: 0.5 }}>
        <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Compania Procesadora de Aluminio, S.A.
          </Typography>
          <FacebookIcon sx={{ fontSize: 18, opacity: 0.8 }} />
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  component="img"
                  src={logoCoproda}
                  alt="Coproda"
                  sx={{ height: 64, width: 'auto', objectFit: 'contain' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#b8221b' }}>
                  Productos de aluminio
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Grid item>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <PhoneInTalkIcon sx={{ color: '#b8221b' }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Telefono
                      </Typography>
                      <Typography variant="body2">+502 2430-0718</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <MailOutlineIcon sx={{ color: '#b8221b' }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Correo electronico
                      </Typography>
                      <Typography variant="body2">info@coproda.com</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <PlaceOutlinedIcon sx={{ color: '#b8221b' }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Direccion
                      </Typography>
                      <Typography variant="body2">15 Calle 38-65, Zona 8</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#273b5d' }}>
        <Container maxWidth="xl" sx={{ py: 1.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  href={item.href}
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontSize: 13,
                    '&:hover': { color: '#ffb6a6' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box id="inicio" sx={{ position: 'relative', minHeight: { xs: 360, md: 520 } }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
          }}
        />
        <Container
          maxWidth="xl"
          sx={{
            position: 'relative',
            zIndex: 1,
            height: { xs: 360, md: 520 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h1" sx={{ fontSize: { xs: 46, md: 84 }, color: 'white' }}>
              CAFETERAS
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              2 piezas
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box id="productos" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.4em', color: '#b8221b' }}>
              COPRODA
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, color: '#273b5d' }}>
              Nuestros productos
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
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 20px 40px rgba(16,20,24,0.08)',
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 34 }, color: '#273b5d', mb: 2 }}>
                Vajillas
              </Typography>
              <Typography variant="body1" sx={{ color: '#4e5a66', mb: 2 }}>
                Lineas elegantes para mesa familiar, restaurantes y grandes eventos. Variedad de tamanos y
                formatos listos para el trabajo diario.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {vajillas.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{ bgcolor: '#f3f4f6', border: '1px solid #e0e0e0' }}
                  />
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 34 }, color: '#273b5d', mb: 2 }}>
                Otros productos
              </Typography>
              <Typography variant="body1" sx={{ color: '#4e5a66', mb: 2 }}>
                Complementos esenciales para cocina y servicio: resistencia, facil manejo y gran capacidad.
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {otrosProductos.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{ bgcolor: '#f3f4f6', border: '1px solid #e0e0e0' }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box id="empresa" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f3f4f6' }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {highlights.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: 4,
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 18px 40px rgba(16,20,24,0.08)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#273b5d' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4e5a66' }}>
                      {item.copy}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="contacto" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, color: '#273b5d', mb: 2 }}>
                Contactenos
              </Typography>
              <Typography variant="body1" sx={{ color: '#4e5a66', mb: 3 }}>
                Visitanos o escribenos para solicitudes de catalogo, precios y distribucion.
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body1">Direccion: 15 Calle 38-65, Zona 8, Guatemala</Typography>
                <Typography variant="body1">Telefono: +502 2430-0718</Typography>
                <Typography variant="body1">Correo: info@coproda.com</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  bgcolor: '#273b5d',
                  p: { xs: 3, md: 4 },
                  borderRadius: 5,
                  color: 'white',
                  boxShadow: '0 22px 40px rgba(16,20,24,0.12)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Acerca de Coproda
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.82, mb: 2 }}>
                  Empresa de tradicion en Guatemala enfocada en crear productos de aluminio con calidad,
                  estilo y diseno, combinando piezas clasicas con opciones modernas.
                </Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                <Button
                  variant="contained"
                  href="#productos"
                  sx={{
                    bgcolor: '#b8221b',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 3,
                    py: 1.2,
                    '&:hover': { bgcolor: '#8a1a15' },
                  }}
                >
                  Explorar productos
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: '#2b2b2b', color: 'white' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Coproda S.A. - Aluminio con historia y vision.
        </Typography>
      </Box>
    </Box>
  )
}
