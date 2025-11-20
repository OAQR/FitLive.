import type { NavItem } from '../types/navigation';

/**
 * Define la estructura de la barra de navegación principal.
 * Esta es la ÚNICA fuente de verdad para la navegación del sitio.
 * Modifica este array para añadir, quitar o reordenar páginas.
 */
export const SIDEBAR_LINKS: NavItem[] = [
  { text: 'Visión General', href: '/docs/index' },
  { text: 'Primeros Pasos', href: '/docs/primeros-pasos' },
  { text: 'Arquitectura del Sistema', href: '/docs/arquitectura-del-sistema' },
  {
    text: 'servicio-clientes: Gestión de Clientes',
    href: '/docs/servicio-clientes',
    children: [
      { text: 'Endpoints de la API REST', href: '/docs/servicio-clientes/endpoints-api-rest' },
      { text: 'Objetos de Transferencia de Datos (DTOs)', href: '/docs/servicio-clientes/objetos-transferencia-datos' },
      { text: 'Capa de Servicio y Lógica de Negocio', href: '/docs/servicio-clientes/capa-servicio-logica-negocio' },
      { text: 'Modelo de Datos y Persistencia', href: '/docs/servicio-clientes/modelo-datos-persistencia' },
      { text: 'Integraciones Externas: PeruDevs API', href: '/docs/servicio-clientes/integraciones-externas-perudevs' },
      { text: 'Configuración y Despliegue', href: '/docs/servicio-clientes/configuracion-y-despliegue' },
      { text: 'Pruebas', href: '/docs/servicio-clientes/pruebas' },
    ],
  },
  {
    text: 'servicio-facturacion: Facturación',
    href: '/docs/servicio-facturacion',
    children: [
      { text: 'Generación de PDF y Códigos QR', href: '/docs/servicio-facturacion/generacion-pdf-qr' },
      { text: 'Configuración y Ajuste', href: '/docs/servicio-facturacion/configuracion-y-ajuste' },
    ],
  },
  { text: 'Configuración del Entorno de Desarrollo', href: '/docs/configuracion-del-entorno-de-desarrollo' },
];
