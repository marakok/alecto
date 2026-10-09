import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: concept 1 at "/" and concept 2 at "/concept-2/".
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        concept2: resolve(import.meta.dirname, 'concept-2/index.html'),
      },
    },
  },
});
