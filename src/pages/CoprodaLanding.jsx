import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
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
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
  { title: 'Vajilla Orquidea', copy: '7 Piezas', image: catalogo1 },
  { title: 'Vajilla Orquidea', copy: '10 Piezas', image: catalogo2 },
  // { title: 'Producto 02', copy: '', image: catalogo2 },
  { title: 'Vajilla Cónica', copy: '3 Piezas', image: catalogo3 },
  { title: 'Vajilla Monja Blanca', copy: '3 Piezas', image: catalogo4 },
  { title: 'Combo de Tinas', copy: '3 Piezas', image: catalogo5 },
  { title: 'Vajilla Restaurante', copy: '4 Piezas', image: catalogo6 },
  { title: 'Vajilla Restaurante', copy: '3 Piezas', image: catalogo7 },
  { title: 'Vajilla Restaurante', copy: '3 Piezas', image: catalogo8 },
]

const servicios = ['Producto %100 Fabricado en Guatemala', 'Excelente Calidad que perdura']

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

const sectionScrollOffset = { xs: '16px', md: '20px' }

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const headerRef = React.useRef(null)

  const getScrollOffset = React.useCallback(() => {
    const headerHeight = headerRef.current?.offsetHeight ?? 0
    const breathingRoom = window.innerWidth < 900 ? 16 : 20

    return headerHeight + breathingRoom
  }, [])

  const scrollToSection = React.useCallback(
    (targetId, duration = 1800) => (event) => {
      event.preventDefault()
      setMobileMenuOpen(false)

      if (typeof window === 'undefined') {
        return
      }

      const target = document.querySelector(targetId)

      if (!target) {
        return
      }

      const startY = window.scrollY
      const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset()
      const distance = targetY - startY
      const startTime = performance.now()

      const easeInOutCubic = (progress) => {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
      }

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeInOutCubic(progress)

        window.scrollTo(0, startY + distance * easedProgress)

        if (progress < 1) {
          window.requestAnimationFrame(animateScroll)
          return
        }

        window.history.replaceState(null, '', targetId)
      }

      window.requestAnimationFrame(animateScroll)
    },
    [getScrollOffset]
  )

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
        ref={headerRef}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 12,
          bgcolor: 'rgba(247,246,244,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e4e7ec',
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 1.25, md: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, justifyContent: 'flex-start' }}>
                <Box component="img" src={logoCoproda} alt="Coproda" sx={{ height: { xs: 40, md: 48 } }} />
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                useFlexGap
                flexWrap="wrap"
                justifyContent="flex-end"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    href={item.href}
                    onClick={scrollToSection(item.href)}
                    sx={{
                      color: '#1f2937',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: { xs: 11, md: 12 },
                      minWidth: 'auto',
                      px: { xs: 1, md: 1.5 },
                      py: { xs: 0.5, md: 0.75 },
                      letterSpacing: { xs: '0.08em', md: '0.12em' },
                      '&:hover': { color: '#ef4444' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                
                <Button
                  variant="contained"
                  href="#contacto"
                  onClick={scrollToSection('#contacto')}
                  sx={{
                    bgcolor: '#111827',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 999,
                    px: { xs: 2, md: 3 },
                    py: { xs: 0.7, md: 0.9 },
                    '&:hover': { bgcolor: '#1f2937' },
                  }}
                >
                  Cotizar
                </Button>
                <Button
                  component={RouterLink}
                  to="/COPRODA/signin"
                  variant="outlined"
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#111827',
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 2.25,
                    py: 0.9,
                    '&:hover': {
                      borderColor: '#111827',
                      bgcolor: 'rgba(17,24,39,0.04)',
                    },
                  }}
                >
                  Acceso
                </Button>
              </Stack>
              <IconButton
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  color: '#111827',
                  border: '1px solid #e4e7ec',
                }}
                aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
              </IconButton>
            </Stack>

            <Collapse in={mobileMenuOpen} timeout={280} sx={{ display: { xs: 'block', md: 'none' } }}>
              <Stack
                spacing={1}
                sx={{
                  pt: 0.5,
                  pb: 0.25,
                  borderTop: '1px solid #e4e7ec',
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    href={item.href}
                    onClick={scrollToSection(item.href)}
                    sx={{
                      justifyContent: 'flex-start',
                      color: '#1f2937',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: 12,
                      letterSpacing: '0.08em',
                      px: 1,
                      py: 1.1,
                      borderRadius: 2,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                
                <Button
                  variant="contained"
                  href="#contacto"
                  onClick={scrollToSection('#contacto')}
                  sx={{
                    mt: 0.5,
                    bgcolor: '#111827',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 2,
                    py: 1,
                    '&:hover': { bgcolor: '#1f2937' },
                  }}
                >
                  Cotizar
                </Button>
                <Button
                  component={RouterLink}
                  to="/COPRODA/signin"
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    borderColor: '#d1d5db',
                    color: '#111827',
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      borderColor: '#111827',
                      bgcolor: 'rgba(17,24,39,0.04)',
                    },
                  }}
                >
                  Acceso
                </Button>
              </Stack>
            </Collapse>
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
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 12 }, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Stack spacing={3}>
                  <Typography variant="overline" sx={{ letterSpacing: { xs: '0.2em', md: '0.4em' }, color: '#ef4444' }}>
                    COMPANIA PROCESADORA DE ALUMINIO
                  </Typography>
                  <Typography variant="h1" sx={{ fontSize: { xs: 34, sm: 40, md: 72 }, lineHeight: 1.02 }}>
                    Aluminio de calidad que perdura.
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4b5563', maxWidth: 520, fontSize: { xs: 18, md: 21 } }}>
                    Fabricamos utensilios de cocina de aluminio con procesos de calidad para hogares y negocios.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      href="#productos"
                      onClick={scrollToSection('#productos')}
                      sx={{
                        bgcolor: '#ef4444',
                        color: 'white',
                        px: 4,
                        py: 1.4,
                        textTransform: 'none',
                        borderRadius: 999,
                        width: { xs: '100%', sm: 'auto' },
                        boxShadow: '0 22px 40px rgba(239,68,68,0.3)',
                        '&:hover': { bgcolor: '#dc2626' },
                      }}
                    >
                      Ver catalogo
                    </Button>
                    <Button
                      variant="outlined"
                      href="#empresa"
                      onClick={scrollToSection('#empresa')}
                      sx={{
                        borderColor: '#111827',
                        color: '#111827',
                        px: 4,
                        py: 1.4,
                        textTransform: 'none',
                        borderRadius: 999,
                        width: { xs: '100%', sm: 'auto' },
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
                  <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
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
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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
              gap: { xs: 1.25, sm: 2, md: 2.5 },
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
                    <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2, fontSize: { xs: 13, sm: 16 } }}>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#4b5563',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 2, sm: 3 },
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: { xs: 10.5, sm: 12 },
                        }}
                      >
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
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Box>
                  <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, color: 'white', mb: 2 }}>
                    Capacidades de produccion
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
                    Estamos preparados para atender necesidades especificas del mercado.
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
                          Fabricar Utensilios de Aluminio.
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
                          Diversidad de productos que se adapten a sus necesidades.
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
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Box>
                  <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, mb: 2 }}>
                    Contacto
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4b5563', mb: 3 }}>
                    Escribenos para solicitudes de catalogo, precios y distribucion.
                  </Typography>
                  <Stack spacing={2}>
                    <Stack
                      component="a"
                      href="tel:+50243912511"
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        width: 'fit-content',
                      }}
                    >
                      <PhoneInTalkIcon sx={{ color: '#ef4444' }} />
                      <Typography variant="body1">+502 4391-2511</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <MailOutlineIcon sx={{ color: '#ef4444' }} />
                      <Typography variant="body1">info@coproda.com.gt</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PlaceOutlinedIcon sx={{ color: '#ef4444', mt: { xs: 0.5, md: 0 } }} />
                      <Typography variant="body1" sx={{ fontSize: { xs: 15, md: 16 } }}>
                        KM 33 Carretera a El Salvador, Proyecto Industrial el Alto, Bodega No. 2, Guatemala
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
                    <Stack spacing={2.5}>
                      {/* <Box
                        component="img"
                        src={logoCoproda}
                        alt="Coproda"
                        sx={{ height: 44, width: 'auto', alignSelf: 'flex-start' }}
                      /> */}

                      <Box>
                        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.18em' }}>
                          CONTACTANOS
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                          Hablemos sobre su siguiente pedido
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                        Escribenos por nuestros canales directos y conoce novedades, catalogos y opciones de compra.
                      </Typography>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                          component="a"
                          href="https://wa.me/message/77O5L2IJLWD4P1"
                          target="_blank"
                          rel="noreferrer"
                          startIcon={<WhatsAppIcon />}
                          sx={{
                            bgcolor: '#25D366',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 999,
                            px: 3,
                            py: 1.2,
                            width: { xs: '100%', sm: 'auto' },
                            '&:hover': { bgcolor: '#1ebe5d' },
                          }}
                        >
                          Escribir por WhatsApp
                        </Button>

                        <Button
                          component="a"
                          href="https://www.facebook.com/CoprodaGuatemala/"
                          target="_blank"
                          rel="noreferrer"
                          startIcon={<FacebookRoundedIcon />}
                          sx={{
                            bgcolor: '#1877F2',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: 999,
                            px: 3,
                            py: 1.2,
                            width: { xs: '100%', sm: 'auto' },
                            '&:hover': { bgcolor: '#1664cc' },
                          }}
                        >
                          Siguenos en Facebook
                        </Button>
                      </Stack>

                    </Stack>
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
          width: { xs: 58, sm: 'auto' },
          height: { xs: 58, sm: 64 },
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
