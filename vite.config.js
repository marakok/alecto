import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// One page per concept: "/" and "/concept-2/" to "/concept-4/", plus phase 2 under "/phase-2/".
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        concept2: resolve(import.meta.dirname, 'concept-2/index.html'),
        concept3: resolve(import.meta.dirname, 'concept-3/index.html'),
        concept4: resolve(import.meta.dirname, 'concept-4/index.html'),
        phase2concept2: resolve(import.meta.dirname, 'phase-2/concept-2/index.html'),
      },
    },
  },
});
