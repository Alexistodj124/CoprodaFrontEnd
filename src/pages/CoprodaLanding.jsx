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
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import logoCoproda from '../assets/logocoprodahome2.png'
import catalogo1 from '../assets/ProductosCatalogo/1.png'
import catalogo2 from '../assets/ProductosCatalogo/2.png'
import catalogo3 from '../assets/ProductosCatalogo/3.png'
import catalogo4 from '../assets/ProductosCatalogo/4.png'
import catalogo5 from '../assets/ProductosCatalogo/5.png'
import catalogo6 from '../assets/ProductosCatalogo/6.png'
import catalogo7 from '../assets/ProductosCatalogo/7.png'
import catalogo8 from '../assets/ProductosCatalogo/8.png'

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

const featuredSets = [
  { title: 'Producto 01', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo1 },
  { title: 'Producto 02', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo2 },
  { title: 'Producto 03', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo3 },
  { title: 'Producto 04', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo4 },
  { title: 'Producto 05', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo5 },
  { title: 'Producto 06', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo6 },
  { title: 'Producto 07', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo7 },
  { title: 'Producto 08', copy: 'Descripcion breve del producto para reemplazar despues.', image: catalogo8 },
]

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

const sectionScrollOffset = { xs: '152px', md: '96px' }

function ScrollReveal({ children, delay = 0, distance = 32, duration = 5000, sx, ...props }) {
  const ref = React.useRef(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current

    if (!node) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      sx={[
        {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
          transitionProperty: 'opacity, transform',
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          transitionDelay: `${delay}ms`,
          willChange: 'opacity, transform',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Box>
  )
}

export default function CoprodaLanding() {
  return (
    <Box sx={{ bgcolor: '#f7f6f4', color: '#111827', minHeight: '100vh' }}>
      <GlobalStyles
        styles={{
          html: {
            scrollBehavior: 'smooth',
          },
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
          '@keyframes whatsPulse': {
            '0%': {
              boxShadow: '0 18px 36px rgba(37, 211, 102, 0.25)',
              transform: 'scale(1)',
            },
            '50%': {
              boxShadow: '0 18px 42px rgba(37, 211, 102, 0.4)',
              transform: 'scale(1.03)',
            },
            '100%': {
              boxShadow: '0 18px 36px rgba(37, 211, 102, 0.25)',
              transform: 'scale(1)',
            },
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

      <Box id="inicio" sx={{ position: 'relative', overflow: 'hidden', scrollMarginTop: sectionScrollOffset }}>
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
              <ScrollReveal>
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
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScrollReveal delay={140} distance={40}>
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
              </ScrollReveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="empresa" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#111827', scrollMarginTop: sectionScrollOffset }}>
        <Container maxWidth="xl">
          <ScrollReveal sx={{ mb: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 42 }, color: 'white' }}>
                Sobre la empresa
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 760 }}>
                Coproda, S.A. es la Compania Procesadora de Aluminio en Guatemala, dedicada a la fabricacion
                de utensilios de cocina con procesos de calidad que garantizan productos durables y confiables.
              </Typography>
            </Stack>
          </ScrollReveal>
          <Grid container spacing={3}>
            {highlights.map((item, index) => (
              <Grid item xs={12} md={4} key={item.title}>
                <ScrollReveal delay={80 * index} distance={36} sx={{ height: '100%' }}>
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
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="productos" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f7f6f4', scrollMarginTop: sectionScrollOffset }}>
        <Container maxWidth="xl">
          <ScrollReveal sx={{ mb: 4 }}>
            <Stack spacing={1} alignItems="center">
              <Typography variant="overline" sx={{ letterSpacing: '0.4em', color: '#ef4444' }}>
                CATALOGO
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
                Productos de aluminio
              </Typography>
            </Stack>
          </ScrollReveal>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {featuredSets.map((item, index) => (
              <ScrollReveal key={item.title} delay={140 * index} distance={38} duration={12000} sx={{ height: '100%' }}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 14px 30px rgba(17,24,39,0.1)',
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.title}
                      sx={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', display: 'block' }}
                    />
                    <CardContent sx={{ p: { xs: 1.25, md: 1.5 } }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75, lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4b5563', lineHeight: 1.5, display: 'block' }}>
                        {item.copy}
                      </Typography>
                    </CardContent>
                  </Card>
                </ScrollReveal>
            ))}
          </Box>
        </Container>
      </Box>

      <Box id="capacidades" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#111827', scrollMarginTop: sectionScrollOffset }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Box>
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
                </Box>
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScrollReveal delay={140} distance={40}>
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
              </ScrollReveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="contacto" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f7f6f4', scrollMarginTop: sectionScrollOffset }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Box>
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
                </Box>
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScrollReveal delay={140} distance={40}>
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
                      component="a"
                      href="https://wa.me/message/77O5L2IJLWD4P1"
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<WhatsAppIcon />}
                      sx={{
                        mt: 1.5,
                        bgcolor: '#25D366',
                        color: 'white',
                        textTransform: 'none',
                        borderRadius: 999,
                        px: 3,
                        py: 1.2,
                        '&:hover': { bgcolor: '#1ebe5d' },
                      }}
                    >
                      Escribir por WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: '#111827', color: 'white' }}>
        <Typography variant="body2" sx={{ opacity: 0.65 }}>
          Coproda S.A. - Compañia Procesadora de Aluminio.
        </Typography>
      </Box>

      <Button
        component="a"
        href="https://wa.me/message/77O5L2IJLWD4P1"
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        startIcon={<WhatsAppIcon sx={{ fontSize: 30 }} />}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 24 },
          minWidth: 'auto',
          width: { xs: 64, sm: 'auto' },
          height: 64,
          px: { xs: 0, sm: 2.5 },
          borderRadius: { xs: '50%', sm: 999 },
          bgcolor: '#25D366',
          color: 'white',
          boxShadow: '0 18px 36px rgba(37, 211, 102, 0.35)',
          animation: 'whatsPulse 2.8s ease-in-out infinite',
          zIndex: 20,
          '&:hover': {
            bgcolor: '#1ebe5d',
            transform: 'translateY(-2px)',
            animationPlayState: 'paused',
          },
          '& .MuiButton-startIcon': {
            margin: { xs: 0, sm: '0 8px 0 0' },
          },
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, whiteSpace: 'nowrap' }}>
          Cotiza por WhatsApp
        </Box>
      </Button>
    </Box>
  )
}
