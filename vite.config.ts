import path from 'path';
import { defineConfig } from 'vite';

function mockInspectorCss() {
  return {
    name: 'mock-inspector-css',
    resolveId(id: string) {
      if (id.endsWith('inspector.dev.css')) {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (id.endsWith('inspector.dev.css')) {
        return '';
      }
      return null;
    },
  };
}

export default defineConfig({
  root: 'client',
  base: '/',
  plugins: [mockInspectorCss()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@client': path.resolve(__dirname, 'client'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
});
