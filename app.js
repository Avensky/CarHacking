const path = require('path');
const cors = require('cors');
const express = require('express');

function setupExpress(app) {
  app.use(cors());
  app.use(express.json());

  app.get('/api/ping', (_, res) => res.send('pong'));
  app.post('/api/cmd', (req, res) => {
    const command = req.body;
    console.log('Received command:', command);
    res.send({ status: 'received' });
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