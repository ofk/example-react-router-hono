import adapter from '@hono/vite-dev-server/cloudflare';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import serverAdapter from 'hono-react-router-adapter/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    serverAdapter({
      adapter,
      entry: 'server/index.ts',
    }),
  ],
});
