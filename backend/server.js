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
        channel.start();

        // default values

        var msg = {
            'id': 500,
            data: [0, 0, 0, 0, 0, 0, 0, 0]
        }

        const canData = {
            speed: 0,
            revs: 0,
            up: true,
            fuel: 500,
            gear: 1,
            index: 0,
        }
        const started = canData;

        const engine = () => {
            const now = started;
            // while gears are engaged and there is fuel inscrease speed
            if (now.fuel > 0) {
                // if engine is on in neutral, raise them to 900
                if (now.gear === 0 && now.revs < 700) {
                    console.log("neutral engine under 700revs");
                    now.revs += 100;
                }
                else if (now.gear === 0 && (now.revs >= 700)) {
                    console.log("neutral engine over 700revs >=");
                    now.revs -= 100;
                }
                // fluctuate rpms to increase from 2000rpms to 6000rpms as speed increases
                // simulating gear shifting in a vehicle

                // continue to inscrease speed until rmps reach 6000rpms
                if (now.gear != 0 && now.revs < 6000) {
                    console.log("in gear, increase speed +1, revs +200");
                    now.revs += 200;
                    now.speed++;
                }
                // whenever rpms reach high numbers its time to shift gears
                else if (now.gear != 0 && now.revs >= 6000) {
                    // if the gear is not maxed out, quickly shift gears up and drop rpms
                    if (now.gear < 6) {
                        console.log("if revs are over 6k gear++, drop revs")
                        now.revs -= 3000;
                        now.gear++;
                    }
                    else if (now.gear >= 6) {
                        // if car is in max gear inscrease speed until it reaches max
                        // speed and rpms
                        if (now.revs < 9000) {
                            console.log("if gear is maxed out and increase revs and speed until max")
                            now.revs += 50;
                            now.speed++;
                        }
                    }
                }
                // Fuel gradually decays
                now.fuel -= 1;

                // Using an index alternate between adding and subtracting revs
                // simulating an engines fluctuation
                if (now.index % 2 === 0) {
                    now.revs += 50;
                } else {
                    now.revs -= 50;
                }

            }
            // if there is no fuel kill the engine
            else if (now.fuel === 0) {
                // set car in neutral
                now.gear = 0;
                // gradually reduce speed
                if (now.speed > 0) {
                    if (now.speed >= 3) {
                        now.speed -= 3;
                    }
                    else if (now.speed >= 1) {
                        now.speed -= 1;
                    }
                }

                // gradually reduce rpms
                if (now.revs > 0) {
                    if (now.revs >= 150) {
                        now.revs -= 150;
                    }
                    else if (now.revs >= 50) {
                        console.log('revs are bigger than 50');
                        now.revs -= 50;
                    }
                    else if (now.revs >= 10) {
                        console.log('revs are bigger than 10');
                        now.revs -= 10;
                    }
                    else if (now.revs >= 5) {
                        console.log('revs are bigger than 5');
                        now.revs -= 5;
                    }
                    else if (now.revs >= 1) {
                        console.log('revs are bigger than 1');
                        now.revs -= 1;
                    }
                }
            }

            // print results
            console.log("speed = ", now.speed);
            console.log("revs  = ", now.revs);
            console.log("gear  = ", now.gear);
            console.log("fuel  = ", now.fuel);
            console.log("------------------");
            now.index++;

            // send data
            var out = {}
            var buff = Buffer.alloc(8)

            buff.writeUIntBE(now.revs, 0, 4)
            buff.writeUIntBE(now.speed, 4, 2)
            buff.writeUIntBE(now.fuel, 6, 2)

            console.log(buff)
            out.id = msg.id
            out.data = buff

            // emit data
            // channel.send(out)


            socket.emit('can message',
                channel.addListener("onMessage", (msg) => {
                    const carInfo = {};
                    carInfo.rpms = msg.data.readUIntBE(0, 4);
                    carInfo.speed = msg.data.readUIntBE(4, 2);
                    carInfo.fuel = msg.data.readUIntBE(6, 2);
                    // carInfo.temp = msg.data.readUIntBE(2, 4);
                    console.log("car info: ", carInfo);
                    io.emit('can message', carInfo);
                })
            )
        }
        // run script every 1 times per second
        setInterval(engine, 1000);

        // Reply any message
        channel.addListener("onMessage", channel.send(out), channel);

    }

    // console transport name
    console.log(`connected with transport ${socket.conn.transport.name}`);

    socket.conn.on("upgrade", (transport) => {
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