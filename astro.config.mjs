// @ts-check
import { defineConfig } from 'astro/config';

// Static output is the default and the point: the whole site is files on a
// CDN.
export default defineConfig({
  site: 'https://osu-demo-catalog.vercel.app',
});
