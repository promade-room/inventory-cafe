import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildTime = Date.now().toString()

function versionPlugin() {
  return {
    name: 'version-plugin',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: buildTime, builtAt: new Date().toISOString() })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), versionPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(buildTime)
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true
      }
    }
  }
})
