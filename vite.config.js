import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// "/" redirects to phase 3 (leading); phase 2 · 2a stays at "/phase-2/concept-2/". Concepts 1 to 4 sit at "/concept-1/" to "/concept-4/", hidden from the switcher.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        concept1: resolve(import.meta.dirname, 'concept-1/index.html'),
        concept2: resolve(import.meta.dirname, 'concept-2/index.html'),
        concept3: resolve(import.meta.dirname, 'concept-3/index.html'),
        concept4: resolve(import.meta.dirname, 'concept-4/index.html'),
        phase2concept2: resolve(import.meta.dirname, 'phase-2/concept-2/index.html'),
        phase2company: resolve(import.meta.dirname, 'phase-2/concept-2/company/index.html'),
        phase2careers: resolve(import.meta.dirname, 'phase-2/concept-2/careers/index.html'),
        phase3home: resolve(import.meta.dirname, 'phase-3/index.html'),
        phase3product: resolve(import.meta.dirname, 'phase-3/product/index.html'),
        phase3lines: resolve(import.meta.dirname, 'phase-3/lines/index.html'),
        phase3story: resolve(import.meta.dirname, 'phase-3/story/index.html'),
      },
    },
  },
});
