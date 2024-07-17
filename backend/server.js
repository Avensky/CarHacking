const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require("cors");
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const path = require('path');
const IP_ADDRESS = process.env.NODE_ENV === "production"
    ? "127.0.0.1"
    : "127.0.0.1" //developing ip
const PORT = process.env.NODE_ENV === "production"
    ? 5000
    : 4000 // dev backend port

// set up cors to allow us to accept requests from our client
app.use(cors());
app.options('*', cors());
// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json()); // parse json data sent to frontend

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

console.log("io");
io.on("connection", (socket) => {
    // Check the user 
    console.log('user: ', socket.id);
    socket.join(`${socket.id}`);

    let canData = {
        speed: 0,
        revs: 0,
        up: true,
        fuel: 500,
        gear: 1,
        index: 0,
    }

    // API CALLS
    app.get('/api/start', (req, res) => {
        // console.log('api pinged backend');
        const command = `node /var/www/CarHacking/_work/CarHacking/CarHacking/backend/car.js`;
        // Execute shell command
        exec(command, (error, stdout, stderr) => {
            console.log('Car.js - Engine Simulation Engaged');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`);
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][error]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`);
            res.end(`Success: ${stdout}`);
        });
    });

    app.get('/api/abort', (req, res) => {
        socket.emit('carSim', canData) // zero out canData for frontend
        // console.log('api pinged backend');
        const command = `killall node`;
        // Execute shell command
        exec(command, (error, stdout, stderr) => {
            console.log('Car.js - Engine Simulation Engaged');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`);
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][error]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`);
            res.end(`Success: ${stdout}`);
        });
    });

    // use data to submit a shell command
    app.post('/api/cmd', (req, res) => {
        // console.log('api pinged backend');
        console.log('cmd: ', req.body);
        const command = req.body.data;
        // Execute shell command
        exec(command, (error, stdout, stderr) => {
            console.log('Command Executed Successfully');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`)
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][error]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`);
            res.end(`${stdout}`);
        });
    });

    app.get('/api/reload', (req, res) => {
        console.log('frontend wants to reload');
        socket.emit('carSim', canData) // zero out canData for frontend
        // Execute shell command
        const command = "pm2 restart CarHacking";
        exec(command, (error, stdout, stderr) => {
            console.log('Command Executed Successfully');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`)
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][error]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`);
            res.end(`Success: ${stdout}`);
        });
    });
    app.get('/api/hack', (req, res) => {
        console.log('Can Attack Sent');
        // Execute shell command
        const command = "cansend vcan0 1F4#AAAAAAAAAAAAAAAA";
        exec(command, (error, stdout, stderr) => {
            console.log('Command Executed Successfully');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`)
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][error]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`)
            res.end(`Success: ${stdout}`);
        });
    });
    app.get('/api/vcanAdd', (req, res) => {
        console.log('Vcan Link Vcan');
        // Execute shell command
        const command = `sudo ip link add dev vcan0 type vcan`;
        exec(command, (error, stdout, stderr) => {
            console.log('Command Executed Successfully');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`)
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][cmd]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`);
            res.end(`Success: ${stdout}`);
        });
    });
    app.get('/api/vcanSetup', (req, res) => {
        console.log('Vcan Link Setup');
        // Execute shell command
        const command = `sudo ip link set up vcan0;`;
        exec(command, (error, stdout, stderr) => {
            console.log('Command Executed Successfully');
            socket.emit('cmdData', `[cmdData][cmd]: ${command}`)
            if (error) {
                console.error(`exec error: ${error}`);
                socket.emit('cmdData', `[cmdData][error]: ${error}`);
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                socket.emit('cmdData', `[cmdData][stderr]: ${stderr}`);
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            socket.emit('cmdData', `[cmdData][stdout]: ${stdout}`);
            res.end(`Success: ${stdout}`);
        });
    });

    const can = require("socketcan");
    const channel = can.createRawChannel("vcan0", true);
    // default values

    // log data being sent by car.js
    // reply any message
    channel.addListener("onMessage", (msg) => {
        // console.log('canData: ', msg.data)
        // socket.emit('canData', JSON.parse(msg.data.toString()));
        canData = {
            rpms: msg.data.readUIntBE(0, 4),
            speed: msg.data.readUIntBE(4, 2),
            fuel: msg.data.readUIntBE(6, 2)
        };
        // console.log("car info: ", canData);
        const res = JSON.stringify(msg.data.data)
        // send data to frontend
        // maybe there is a way to only send one? and manipulate the data 
        // in the frontedn but this works. could be optimized.
        socket.emit('cmdData', `[carSim]: ${res}`) //send car data to frontend logs
        socket.emit('carSim', canData) //send data to app
    })

    channel.start()

    socket.on("disconnect", (reason) => {
        console.log(`disconnected due to ${reason}`);
        channel.stop();
    });

    // console transport name
    console.log(`connected with transport ${socket.conn.transport.name}`);

    socket.conn.on("upgrade", (transport) => {
        console.log(`transport upgraded to ${transport.name}`);
    });

    socket.on("disconnect", (reason) => {
        console.log(`disconnected due to ${reason}`);
    });

    // handler errors
    socket.on('error', (err) => {
        console.error('Socket.IO error:', err);
    });
});

// launch server in production mode
if (process.env.NODE_ENV === 'production') {
    // Serve production assets
    app.use(express.static('../frontend/build'))
    // Express will serve up the index.html file
    const filepath = path.join(__dirname, '../frontend/build/index.html');

    app.get('/', (req, res) => {
        res.sendFile(filepath, function (err) {
            if (err)
                return res.status(err.status).end();
            else
                return res.status(200).end();
        })
    })
}

// start the server
server.listen(PORT, IP_ADDRESS, (err) => {
    if (!err) {
        console.log('server started running on: ' + PORT);
        console.log('server NODE_ENV: ' + process.env.NODE_ENV);
    } else {
        console.log('unable to start server');
    }
});