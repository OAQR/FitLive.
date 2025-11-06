import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const diagramsCollection = defineCollection({
  type: 'data', 
  schema: ({ image }) => z.object({
    title: z.string(),
    page: z.object({
      title: z.string(),
      url: z.string(),
    }),
    image: image(), 
    description: z.string(), 
    plantUML: z.string(),
    mermaid: z.string(),
  }),
});

export const collections = {
  docs: docsCollection,
  diagrams: diagramsCollection,
};