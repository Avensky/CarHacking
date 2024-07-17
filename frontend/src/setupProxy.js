const { createProxyMiddleware } = require("http-proxy-middleware");

let baseUrl

process.env.NODE_ENV === "production"
  ? baseUrl = "http://localhost:5000"
  : baseUrl = "http://localhost:4000" //dev ip

module.exports = function (app) {
  app.use(
    ["/api"],
    createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
    })
  );
};
