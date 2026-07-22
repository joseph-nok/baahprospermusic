import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite' // 🔧 Imports the official serverless bundler hook

export default defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    nitro(), // 🚀 This automatically builds the perfect SSR preset for Vercel!
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  define: {
    'process.env.VITE_CONVEX_URL': JSON.stringify(process.env.VITE_CONVEX_URL),
    'process.env.CONVEX_DEPLOYMENT': JSON.stringify(process.env.CONVEX_DEPLOYMENT),
  },
})
