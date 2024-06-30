var express = require('express');
var app = express();
var server = require('http').createServer(app);
const PORT = 5000;
const LOCAL = "127.0.0.1";
if (process.env.NODE_ENV === "production") {
    var can = require("socketcan");
    var io = require('socket.io')(server);
}

// socket io documentation sample

// io.sockets.on('connection', function (socket) {
//     socket.on('set nickname', function (name) {
//       socket.set('nickname', name, function () {
//         socket.emit('ready');
//       });
//     });

//     socket.on('msg', function () {
//       socket.get('nickname', function (err, name) {
//         console.log('Chat message by ', name);
//       });
//     });
// });


// app.use(express.static(__dirname + '/html'));
// app.use('/scripts', express.static(__dirname + '/node_modules/canvas-gauges/'));



// launch
if (process.env.NODE_ENV === 'production') {

    io.on('connection', function (client) {
        console.log('client connected')
    })


    var channel = can.createRawChannel("vcan0", true);

    var carInfo = {};
    carInfo.speed = 0
    carInfo.revs = 0

    carInfo.fuel = 0



    setInterval(() => {
        io.emit('carMessage', carInfo)
    }, 100)

    channel.addListener("onMessage", function (msg) {


        carInfo.revs = msg.data.readUIntBE(0, 4)
        carInfo.speed = msg.data.readUIntBE(4, 2)

        carInfo.fuel = msg.data.readUIntBE(6, 2)

        console.log(carInfo)
    })

    channel.start()



    // Express will serve up production assets
    app.use(express.static('./frontend/build'))
    app.use('/scripts', express.static(__dirname + '/node_modules/canvas-gauges/'));

    // Express will serve up the index.html file
    const path = require('path');
    const filepath = path.join(__dirname, './frontend/build/index.html');

    app.get('*', (req, res) => {
        res.sendFile(filepath, function (err) {
            if (err)
                return res.status(err.status).end();
            else
                return res.status(200).end();
        })
    })
}

server.listen(PORT, LOCAL, (err) => {
    if (!err) {
        console.log('server started running on: ' + PORT);
        console.log('server NODE_ENV: ' + process.env.NODE_ENV);
    } else {
        console.log('unable to start server');
    }
}
)
