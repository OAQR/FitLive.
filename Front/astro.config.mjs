import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'url';

// Plugin de Vite personalizado para reescribir la cabecera 'Host'
const rewriteHostPlugin = () => ({
  name: 'rewrite-host-header',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Si la cabecera 'Host' es 'app.sdutp.xyz', la reescribimos a 'localhost'
      // antes de que Vite la valide.
      if (req.headers.host === 'app.sdutp.xyz') {
        req.headers.host = `localhost:${server.config.server.port || 4321}`;
      }
      next(); // Continúa con el siguiente middleware
    });
  },
});

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],

  server: {
    port: 4321,
    host: true, 
  },

  vite: {
    resolve: {
      alias: {
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      },
    },

    // --- SECCIÓN MODIFICADA ---
    plugins: [
      // Añadimos nuestro plugin personalizado aquí
      rewriteHostPlugin(),
    ],
    
    server: {
      // Dejamos la configuración de HMR
      hmr: {
        clientPort: 443
      }
    }
  },
});