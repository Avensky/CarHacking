const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const cors = require('cors');
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const IP = process.env.NODE_ENV === "production"
  ? "http://192.168.41.216"
  : "http://localhost:5173"

const io = new Server(server, {
  cors: {
    origin: IP, // Replace with your Vite frontend URL
    methods: ['GET', 'POST']
  }
});

const { setupExpress } = require('./app');
const { setupSocketIO } = require('./socket');

app.use(cors());
app.options(IP, cors());  // Adjust according to your frontend's origin

setupExpress(app);
setupSocketIO(io);

server.listen(PORT, (err) => {
  if (!err) {
    console.log('server started running on: ' + PORT);
    console.log('server NODE_ENV: ' + process.env.NODE_ENV);
  } else {
    console.log('unable to start server');
  }
});