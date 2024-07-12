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

// API CALLS
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.get('/api/start', ping);
const ping = (req, res) => {
    console.log("ping succesful");
    res.send('ping');
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
        let canData = {
            speed: 0,
            revs: 0,
            up: true,
            fuel: 500,
            gear: 1,
            index: 0,
        }

        socket.join("carSim");
        // send data to frontend using .emit, every interval
        setInterval(() => socket.to('carSim').emit('canMessage', canData), 1000)

        // listen to data being sent by car.js
        channel.addListener("onMessage", (msg) => {
            canData = {
                rpms: msg.data.readUIntBE(0, 4),
                speed: msg.data.readUIntBE(4, 2),
                fuel: msg.data.readUIntBE(6, 2)
            };
            console.log("car info: ", canData);
        })
        channel.start()
    }
    // console transport name
    console.log(`connected with transport ${socket.conn.transport.name}`);

    // socket.conn.on("upgrade", (transport) => {
    //     console.log(`transport upgraded to ${transport.name}`);
    // });

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