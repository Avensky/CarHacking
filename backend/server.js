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

    // API CALLS
    app.get('/api/start', (req, res) => {
        console.log('api pinged backend');
        const command = `node /var/www/CarHacking/_work/CarHacking/CarHacking/backend/car.js`;
        // Execute shell command
        exec(command, (error, stdout, stderr) => {
            console.log('Start Car.js Engine Simulation');
            socket.emit('canData', 'Start Car.js Engine Simulation')
            if (error) {
                console.error(`exec error: ${error}`);
                // res.sendStatus(200).json({
                //     status: 'failed',
                //     error: error
                // });
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                // res.sendStatus(500).json({
                //     status: 'failed',
                //     stderr: stderr
                // });
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            // res.sendStatus(200).json({
            //     status: 'success',
            //     message: 'Engine Started',
            //     stderr: stderr,
            // });
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
            socket.emit('canData', 'New Shell Command Executed')
            if (error) {
                console.error(`exec error: ${error}`);
                // res.sendStatus(200).json({
                //     status: 'failed',
                //     error: error
                // });
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                // res.sendStatus(500).json({
                //     status: 'failed',
                //     stderr: stderr
                // });
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            // res.sendStatus(200).json({
            //     status: 'success',
            //     message: 'Shell Command Executed Successfully',
            //     stdout: stdout,
            // });
            res.end(`Success: ${stdout}`);
        });
    });

    app.get('/api/reload', (req, res) => {
        console.log('frontend wants to reload');
        // Execute shell command
        const command = "pm2 restart CarHacking";
        exec(command, (error, stdout, stderr) => {
            console.log('Command Executed Successfully');
            socket.emit('canData', 'New Shell Command Executed')
            if (error) {
                console.error(`exec error: ${error}`);
                // res.sendStatus(200).json({
                //     status: 'failed',
                //     error: error
                // });
                res.end(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                // res.sendStatus(500).json({
                //     status: 'failed',
                //     stderr: stderr
                // });
                res.end(`Stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            // res.sendStatus(200).json({
            //     status: 'success',
            //     message: 'Shell Command Executed Successfully',
            //     stdout: stdout,
            // });
            res.end(`Success: ${stdout}`);
        });
    });

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
        // log data being sent by car.js
        channel.addListener("onMessage", (msg) => {
            console.log('canData: ', msg.data)
            // socket.emit('canData', msg.data);
            canData = {
                rpms: msg.data.readUIntBE(0, 4),
                speed: msg.data.readUIntBE(4, 2),
                fuel: msg.data.readUIntBE(6, 2)
            };
            console.log("car info: ", canData);
        })

        // reply any message
        channel.addListener("onMessage",
            () => socket.emit('carSim', canData)
        )
        channel.start()

        socket.on("disconnect", (reason) => {
            console.log(`disconnected due to ${reason}`);
            channel.stop();
        });
    }
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