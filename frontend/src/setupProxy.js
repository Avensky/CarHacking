const { createProxyMiddleware } = require("http-proxy-middleware");

let baseUrl

process.env.NODE_ENV === "production"
  ? baseUrl = "http://localhost:5000"
  : baseUrl = "http://192.168.0.153:4000"

module.exports = function (app) {
  app.use(
    ["/api"],
    createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
    })
  );
};
