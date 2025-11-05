export default {
  server: { port: 5173 },
  define: {
    __API__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:4000')
  }
}
