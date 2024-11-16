import { createProxyMiddleware } from 'http-proxy-middleware'

let baseUrl

if (process.env.NODE_ENV === 'production') {
  baseUrl = 'http://127.0.0.1:5000'
} else {
  baseUrl = 'http://127.0.0.1:4091'
}
module.exports = function (app) {
  app.use(
    ['/api'],
    createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
    }),
  )
}
