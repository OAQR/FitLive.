/**
 * Define las estructuras de tipos para la navegación del sitio.
 */

/** Representa un enlace de navegación simple. */
interface NavLink {
  text: string;
  href: string;
}

/** Representa un grupo de navegación con sub-enlaces. */
interface NavGroup {
  text: string;
  href: string;
  children: NavItem[];
}

/**
 * Representa cualquier elemento de la barra de navegación, que puede ser
 * un enlace simple (`NavLink`) o un grupo con enlaces anidados (`NavGroup`).
 */
export type NavItem = NavLink | NavGroup;

/**
 * Define la estructura de un encabezado extraído por Astro,
 * utilizado para generar la Tabla de Contenidos.
 */
export interface Heading {
  depth: number;
  slug: string;
  text: string;
}