import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@store': resolve(__dirname, 'src/store'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // Enable CORS for development
    cors: true,
    // Hot Module Replacement
    hmr: {
      overlay: false, // Disable error overlay for better development experience
    },
  },
  define: {
    'process.env': {},
    // Enable performance monitoring flags
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
    // Version for cache busting
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
    ],
    exclude: [
      // Large components that should be code-split
    ],
  },
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2018',
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['zustand'],
          'ui-vendor': ['@heroicons/react'],
          
          // Feature chunks
          'activity': [
            './src/pages/ActivityList/ActivityList.tsx',
            './src/pages/ActivityDetail/ActivityDetail.tsx',
            './src/components/ActivityCard/ActivityCard.tsx'
          ],
          'auth': [
            './src/pages/Login/Login.tsx',
            './src/pages/Profile/Profile.tsx'
          ],
          'utils': [
            './src/utils/performance.tsx',
            './src/utils/notifications.ts',
            './src/utils/designSystem.ts'
          ]
        },
        
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        // Remove unused code
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        // Keep function names for better error reporting
        keep_fnames: process.env.NODE_ENV === 'development',
      },
    },
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    port: 4173,
    host: true,
  },
  assetsInclude: [
    // Include common asset types
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.webp',
    '**/*.woff',
    '**/*.woff2',
  ],
  esbuild: {
    // Remove debugger statements
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    // Optimize for speed in development
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    minifySyntax: true,
    minifyWhitespace: process.env.NODE_ENV === 'production',
  },
});
