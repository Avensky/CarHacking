const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// const server = require('http').createServer(app);
const cors = require("cors");
// const LOCAL = "127.0.0.1";
const PORT = process.env.NODE_ENV === "production" ? 5000 : 4000;

// set up cors to allow us to accept requests from our client
app.use(cors());
app.options('*', cors());

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

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

console.log("io");
io.on("connection", (socket) => {
    if (process.env.NODE_ENV === "production") {
        const can = require("socketcan");
        const channel = can.createRawChannel("vcan0", true);
        // default values
        const carInfo = {};
        carInfo.speed = 0
        carInfo.rpms = 0
        carInfo.fuel = 0

        setInterval(() => {
            io.emit('can message', carInfo)
        }, 3000)

        // recieves car data from car.js script
        channel.addListener("onMessage", function (msg) {
            carInfo.rpms = msg.data.readUIntBE(0, 4);
            carInfo.speed = msg.data.readUIntBE(4, 2);
            carInfo.fuel = msg.data.readUIntBE(6, 2);
            console.log("car info: ", carInfo);
        })

        channel.start();
    }

    // 1
    console.log(`connected with transport ${socket.conn.transport.name}`);

    // socket.on('can message', (from, msg) => {
    //     msg.channel.addListener("onMessage", function (data) {
    //         console.log('listener data', data);
    //     });
    //     console.log('Recieved message by', from, 'sayin ', msg);
    // });

    socket.conn.on("upgrade", (transport) => {
        // 2
        console.log(`transport upgraded to ${transport.name}`);
    });

    socket.on("disconnect", (reason) => {
        console.log(`disconnected due to ${reason}`);
    });

    // socket.on('create-something', (msg) => {
    //     io.emit('create-something', msg);
    //     console.log('message: ' + msg);
    // });

    // handler errors
    socket.on('error', (err) => {
        console.error('Socket.IO error:', err);
    });
});