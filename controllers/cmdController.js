
// API CALLS
app.get('/api/ping', (req, res) => {
    console.log('api pinged backend');
    res.sendStatus(200).JSON({ status: "sucess" });
});

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
    const command = `killall node`;
    // Execute shell command
    exec(command, (error, stdout, stderr) => {
        console.log('Abort Engaged');
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
        // console.log(`stdout: ${stdout}`);
        socket.emit('cmdData', `[cmdData][stdout]: Kill All Success`);
        res.end(`Success: Abort All`);
    });
});

// use data to submit a shell command
app.post('/api/cmd', (req, res) => {
    // console.log('api pinged backend');
    console.log('cmd: ', req.body);
    const command = req.body.data;
    // Execute shell command
    exec(command, (error, stdout, stderr) => {
        // console.log('Command Executed Successfully');
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
    // Execute shell command
    const command = "pm2 restart CarHacking";
    // socket.emit('carSim', canData) // zero out canData for frontend
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

app.get('/api/stop', (req, res) => {
    console.log('Can Attack Sent');
    // Execute shell command
    const command = "cansend vcan0 1F4#0000000000000000";
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