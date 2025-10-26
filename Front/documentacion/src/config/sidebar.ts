import type { NavItem } from '../types/navigation';

/**
 * Define la estructura de la barra de navegación principal.
 * Esta es la ÚNICA fuente de verdad para la navegación del sitio.
 * Modifica este array para añadir, quitar o reordenar páginas.
 */
export const SIDEBAR_LINKS: NavItem[] = [
  { text: 'Visión General', href: '/docs/overview' },
  { text: 'Primeros Pasos', href: '/docs/getting-started' },
  { text: 'Arquitectura del Sistema', href: '/docs/system-architecture' },
  {
    text: 'servicio-clientes: Gestión de Clientes',
    href: '/docs/service-clients',
    children: [
      { text: 'Endpoints de la API REST', href: '/docs/service-clients/rest-api-endpoints' },
      { text: 'Objetos de Transferencia (DTOs)', href: '/docs/service-clients/dtos' },
      // ... más sub-enlaces
    ],
  },
  {
    text: 'servicio-facturacion: Facturación',
    href: '/docs/service-facturacion',
    children: [
      { text: 'Generación de PDF y Códigos QR', href: '/docs/service-facturacion/pdf-qr' },
      // ... más sub-enlaces
    ],
  },
  { text: 'External Integrations: PeruDevs API', href: '/docs/External-Integrations-PeruDevs-API' },
];