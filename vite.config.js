import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Three pages: concept 1 at "/", concept 2 at "/concept-2/" and concept 3 at "/concept-3/".
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        concept2: resolve(import.meta.dirname, 'concept-2/index.html'),
        concept3: resolve(import.meta.dirname, 'concept-3/index.html'),
      },
    },
  },
});
