import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import path from 'path' // Thêm dòng này

// https://vite.dev/config/
export default defineConfig({
  // 1. Đảm bảo base là đường dẫn tuyệt đối
  base: '/',

  define: {
    'process.env': process.env
  },
  plugins: [
    react(),
    svgr()
  ],
  resolve: {
    alias: [
      // 2. Sử dụng path.resolve để đảm bảo alias luôn đúng khi build
      { find: '~', replacement: path.resolve(__dirname, './src') }
    ]
  }
})
