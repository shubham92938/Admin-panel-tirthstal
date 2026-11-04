import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL?.trim() || ''

  if (mode === 'production' && !apiUrl) {
    throw new Error('VITE_API_URL is required for production builds. Set it to the backend API root, including /api.')
  }

  return {
    plugins: [react()],
    define: {
      __VITE_API_URL__: JSON.stringify(apiUrl),
      __VITE_PROD__: JSON.stringify(mode === 'production'),
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
    },
    preview: {
      host: '0.0.0.0',
      allowedHosts: true,
    },
    resolve: {
      alias: {
        react: new URL('./node_modules/react', import.meta.url).pathname,
        'react-dom': new URL('./node_modules/react-dom', import.meta.url).pathname,
      },
    },
  }
})
