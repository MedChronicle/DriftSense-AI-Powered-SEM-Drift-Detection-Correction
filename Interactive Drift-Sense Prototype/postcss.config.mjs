import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver(): Plugin {
  return {
    name: 'figma-asset-resolver',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
      // Prevent duplicate React copies (breaks hooks / context)
      dedupe: ['react', 'react-dom'],
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],

    server: {
      port: 5173,
      strictPort: false,
      host: true, // expose on LAN for device testing
      open: false,
    },

    preview: {
      port: 4173,
    },

    build: {
      target: 'es2020',
      sourcemap: !isProd,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // Split heavy vendor groups into stable, cacheable chunks
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return 'react-vendor'
            }
            if (id.includes('@radix-ui')) return 'radix'
            if (id.includes('lucide-react')) return 'icons'
          },
        },
      },
    },

    esbuild: {
      // Strip console/debugger from production bundles
      drop: isProd ? ['console', 'debugger'] : [],
    },
  }
})
