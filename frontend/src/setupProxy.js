/* eslint-disable no-undef */
const { createProxyMiddleware } = require("http-proxy-middleware");

let baseUrl

process.env.NODE_ENV === "production"
  ? baseUrl = "http://localhost:5000"
  : baseUrl = "http://127.0.0.1:4000"

module.exports = function (app) {
  app.use(
    ["/api"],
    createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
    })
  );
}; ``