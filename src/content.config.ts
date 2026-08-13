import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buildDemoSchema } from './lib/demo-schema';

// One directory per demonstration under src/content/demos/, containing
// index.md plus its photographs. The frontmatter `slug` overrides the
// path-derived entry id (documented glob() loader behavior), which is what
// turns demos/rotating-stool-dumbbells/index.md into the entry id
// "rotating-stool-dumbbells" rather than "rotating-stool-dumbbells/index".
// tests/content-invariants.test.ts asserts slug === directory name, so id,
// slug, and directory can never drift apart.
const demos = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/demos' }),
  schema: ({ image }) => buildDemoSchema(image),
});

export const collections = { demos };
