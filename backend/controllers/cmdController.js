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
        socket.emit('cmdData', `${command}`);
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`);
        res.end(`Success: ${stdout}`);
    });
});
app.get('/api/abort', (req, res) => {
    // console.log('api pinged backend');
    const command = `killall node`;
    // Execute shell command
    exec(command, (error, stdout, stderr) => {
        console.log('Car.js - Engine Simulation Engaged');
        socket.emit('cmdData', `${command}`);
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`);
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
        socket.emit('cmdData', `${command}`)
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`);
        res.end(`${stdout}`);
    });
});

app.get('/api/reload', (req, res) => {
    console.log('frontend wants to reload');
    // Execute shell command
    const command = "pm2 restart CarHacking";
    exec(command, (error, stdout, stderr) => {
        console.log('Command Executed Successfully');
        socket.emit('cmdData', `${command}`)
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`);
        socket.emit('carSim', `${command}`)
        res.end(`Success: ${stdout}`);
    });
});
app.get('/api/hack', (req, res) => {
    console.log('Can Attack Sent');
    // Execute shell command
    const command = "cansend vcan0 1F4#AAAAAAAAAAAAAAAA";
    exec(command, (error, stdout, stderr) => {
        console.log('Command Executed Successfully');
        socket.emit('cmdData', `${command}`)
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`)
        res.end(`Success: ${stdout}`);
    });
});
app.get('/api/vcanAdd', (req, res) => {
    console.log('Vcan Link Vcan');
    // Execute shell command
    const command = `sudo ip link add dev vcan0 type vcan`;
    exec(command, (error, stdout, stderr) => {
        console.log('Command Executed Successfully');
        socket.emit('cmdData', `${command}`)
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`);
        res.end(`Success: ${stdout}`);
    });
});
app.get('/api/vcanSetup', (req, res) => {
    console.log('Vcan Link Setup');
    // Execute shell command
    const command = `sudo ip link set up vcan0;`;
    exec(command, (error, stdout, stderr) => {
        console.log('Command Executed Successfully');
        socket.emit('cmdData', `${command}`)
        if (error) {
            console.error(`exec error: ${error}`);
            socket.emit('cmdData', `${error}`);
            res.end(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            socket.emit('cmdData', `${stderr}`);
            res.end(`Stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `${stdout}`);
        res.end(`Success: ${stdout}`);
    });
});

if (process.env.NODE_ENV === "production") {
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
        console.log("car info: ", canData);
        socket.emit('carSim', canData)
    })

    channel.start()

    socket.on("disconnect", (reason) => {
        console.log(`disconnected due to ${reason}`);
        canData = {
            speed: 0,
            rpms: 0,
            fuel: 0,
        }
        socket.emit('carSim', canData)
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