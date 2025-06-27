const path = require('path');
const cors = require('cors');
const express = require('express');
const AppError = require('./utils/appError');
const cmdRouter = require('./routes/cmdRouter');

function setupExpress(app) {
  app.use(cors());
  app.use(express.json());

  // routes
  app.use("/api/v1/", cmdRouter)

  // catches all non existing routes
  app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

  // launch server in production mode
  if (process.env.NODE_ENV === 'production') {
    // Serve production assets
    app.use(express.static('./frontend/dist'))
    // Express will serve up the index.html file
    const filepath = path.join(__dirname, './frontend/dist/index.html');

    app.get('/', (req, res) => {
      res.sendFile(filepath, function (err) {
        if (err)
          return res.status(err.status).end();
        else
          return res.status(200).end();
      })
    })
  }
}

module.exports = { setupExpress };