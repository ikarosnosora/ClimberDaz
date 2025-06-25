import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React optimization features
      babel: {
        plugins: [
          // Note: PropTypes removal is handled by React plugin automatically
        ].filter(Boolean),
      },
    })
  ],
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
    // Hot Module Replacement optimizations
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
      'axios',
      'dayjs',
      'idb',
      'socket.io-client',
      'react-toastify'
    ],
    exclude: [
      // Large components that should be code-split
    ],
  },
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Phase 4: Enhanced build optimizations
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    minify: 'terser',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500, // Stricter warning limit
    
    rollupOptions: {
      output: {
        // Aggressive chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - split by importance and size
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'state': ['zustand'],
          'ui-icons': ['@heroicons/react'],
          'http-client': ['axios'],
          'datetime': ['dayjs'],
          'storage': ['idb'],
          'notifications': ['react-toastify', 'socket.io-client'],
          
          // Feature-based chunks
          'auth-features': [
            './src/pages/Login/Login.tsx',
            './src/pages/Profile/Profile.tsx',
            './src/components/Profile/EditProfileModal.tsx'
          ],
          'activity-features': [
            './src/pages/ActivityList/ActivityList.tsx',
            './src/pages/ActivityDetail/ActivityDetail.tsx',
            './src/pages/CreateActivity/CreateActivity.tsx',
            './src/components/ActivityCard/ActivityCard.tsx',
            './src/components/SwipeableActivityCard/SwipeableActivityCard.tsx'
          ],
          'review-features': [
            './src/pages/ReviewForm/ReviewForm.tsx',
            './src/components/Review/ReviewHistory.tsx'
          ],
          'admin-features': [
            './src/pages/AdminDashboardPage/AdminDashboardPage.tsx'
          ],
          'utils': [
            './src/utils/performance.ts',
            './src/utils/notifications.ts',
            './src/utils/designSystem.ts',
            './src/utils/offlineManager.ts',
            './src/utils/realTimeManager.ts'
          ]
        },
        
        // Optimize asset naming with better caching strategy
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash:8][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash:8][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash:8][extname]`;
          }
          
          return `assets/[name]-[hash:8][extname]`;
        },
        
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          // Use shorter hashes for better caching
          return `assets/js/[name]-[hash:8].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash:8].js',
      },
    },
    
    // Source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Enhanced terser options for Phase 4
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        // Remove unused code more aggressively
        pure_funcs: process.env.NODE_ENV === 'production' ? 
          ['console.log', 'console.info', 'console.debug'] : [],
        // Additional compression options
        dead_code: true,
        unused: true,
        arguments: true,
        keep_infinity: true,
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        // Keep function names only in development for debugging
        keep_fnames: process.env.NODE_ENV === 'development',
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        // Remove comments in production
        comments: process.env.NODE_ENV === 'development',
      },
    },
  },
  
  preview: {
    port: 4173,
    host: true,
  },
  
  // Phase 4: Enhanced asset handling
  assetsInclude: [
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.webp',
    '**/*.avif', // Next-gen image format
    '**/*.woff',
    '**/*.woff2',
  ],
  
  // Phase 4: Optimized esbuild settings
  esbuild: {
    // Remove debugger statements
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    // Optimize for speed in development, size in production
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    minifySyntax: true,
    minifyWhitespace: process.env.NODE_ENV === 'production',
    // Enable tree shaking
    treeShaking: true,
    // Target modern browsers
    target: 'es2020',
  },
  
  // Phase 4: Performance monitoring in development
  ...(process.env.NODE_ENV === 'development' && {
    define: {
      ...defineConfig({}).define,
      __PERFORMANCE_MONITORING__: 'true',
    },
  }),
});
