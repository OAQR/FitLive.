import { defineCollection, z } from 'astro:content';

// Definimos la colección 'docs'
const docsCollection = defineCollection({
  type: 'content', // tipo de contenido, puede ser 'content' o 'data'
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Podríamos añadir más campos, como una imagen de portada:
    // cover: image().optional(), 
  }),
});

// Exportamos un objeto con todas nuestras colecciones
export const collections = {
  docs: docsCollection,
};