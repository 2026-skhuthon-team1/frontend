import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 브라우저에서 배포된 백엔드를 직접 호출하면 CORS에 막히므로
    // 개발 서버가 같은 출처(origin)로 대신 중계해준다
    proxy: {
      '/api': {
        target: 'https://api.sanidine.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
