/**
 * Configuración centralizada para metadatos del sitio, constantes de UI y
 * otras variables globales. Este es el único lugar para ajustar estos valores.
 */
export const SITE_CONFIG = {
    // Metadatos del sitio
    title: "Documentación FitLive",
    description: "Documentación oficial y guías técnicas para el sistema FitLive.",
    lang: "es",

    // Configuración de la Tabla de Contenidos (TOC)
    toc: {
        minDepth: 1, // Nivel mínimo de encabezado a mostrar (ej. <h1>)
        maxDepth: 4, // Nivel máximo de encabezado a mostrar (ej. <h3>)
        heading: "En esta página",
    },

    // Textos de la UI
    ui: {
        lastUpdated: "Última actualización",
    },

    // URL base del repositorio de código fuente para los enlaces de referencia
    sourceRepo: "https://github.com/OAQR/FitLive./blob/be2c9957",
};