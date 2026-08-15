// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Static output is the default and the point: the whole site is files on a
// CDN.
export default defineConfig({
  site: 'https://osu-demo-catalog.vercel.app',
  // Math renders to static HTML at build time; KaTeX ships CSS and fonts,
  // never client JavaScript. Astro 7's default processor (Sätteri) parses
  // math but leaves it as code spans, so the unified pipeline carries the
  // KaTeX rendering.
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
