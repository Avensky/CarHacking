const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// const server = require('http').createServer(app);
const cors = require("cors");
// const LOCAL = "127.0.0.1";
const PORT = 5000;

// set up cors to allow us to accept requests from our client
app.use(cors());
app.options('*', cors());

if (process.env.NODE_ENV === "production") {
    console.log("using socketcan");
    const can = require("socketcan");
    const channel = can.createRawChannel("vcan0", true);

    const carInfo = {};
    carInfo.speed = 0
    carInfo.revs = 0
    carInfo.fuel = 0

    setInterval(() => {
        io.emit('carMessage', carInfo)
    }, 100)

    channel.addListener("onMessage", function (msg) {
        carInfo.revs = msg.data.readUIntBE(0, 4);
        carInfo.speed = msg.data.readUIntBE(4, 2);
        carInfo.fuel = msg.data.readUIntBE(6, 2);
        console.log("car info: ", carInfo);
    })

    channel.start();
}

// app.use(express.static(__dirname + '/html'));
// app.use('/scripts', express.static(__dirname + '/node_modules/canvas-gauges/'));

// launch
if (process.env.NODE_ENV === 'production') {

    // Express will serve up production assets
    app.use(express.static('../frontend/build'))
    // app.use('/scripts', express.static(__dirname + '/node_modules/canvas-gauges/'));

    // Express will serve up the index.html file
    const path = require('path');
    console.log("__dirname", __dirname);
    const filepath = path.join(__dirname, '../frontend/build/index.html');

    app.get('*', (req, res) => {
        res.sendFile(filepath, function (err) {
            if (err)
                return res.status(err.status).end();
            else
                return res.status(200).end();
        })
    })
}

server.listen(PORT, (err) => {
    if (!err) {
        console.log('server started running on: ' + PORT);
        console.log('server NODE_ENV: ' + process.env.NODE_ENV);
    } else {
        console.log('unable to start server');
    }
});

const { Server } = require('socket.io');

const io = new Server(server);

io.on("connection", (socket) => {
    console.log(`connected with transport ${socket.conn.transport.name}`);

    socket.conn.on("upgrade", (transport) => {
        console.log(`transport upgraded to ${transport.name}`);
    });

    socket.on("disconnect", (reason) => {
        console.log(`disconnected due to ${reason}`);
    });
});