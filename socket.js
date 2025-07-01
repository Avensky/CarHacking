// socket.js
const { stepWorld, updateVehicleControls } = require('./physics');
const { createVehicle } = require('./physics/vehicles');
const getVehicleConfig = require('./utils/vehicleConfigs');

// Connect to Socketcan on Production (Linux)
let channel;
if (process.env.NODE_ENV === "production") {
  const can = require("socketcan");
  channel = can.createRawChannel("vcan0", true);
  channel.addListener("onMessage", msg => console.log("Received CAN:", msg));
  channel.start();
}

// Store All User Inputs
const controlMap = {};

// Setup Socket Connection to Fronend
function setupSocketIO(io) {
  io.on('connect', (socket) => {
    console.log('Client connected:', socket.id);

    // User Controls From Frontend
    controlMap[socket.id] =
    {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
      reset: false,
      headlights: false,
      blinkerLeft: false,
      blinkerRight: false,
      hazards: false,
      engineOn: false,
    }

    socket.on('spawnPlayer', (data) => {
      // Get Vehicle Data for Specific Vehicle
      const config = getVehicleConfig(data.vehicle);
      data.vehicleConfig = config

      // Add Vehicle to Physics Engine
      createVehicle(socket.id, data.vehicle);

      // Send Vehicle Data to Frontend
      socket.emit('spawnPlayer', data);
    });

    // Recieve User Input Data
    socket.on('controls', (data) => {

      // Store User's Inputs
      controlMap[socket.id] = data;
    });

    // Delete Control Data On Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      delete controlMap[socket.id];
    });
  });

  // Send Data at 60 Frames Per Second
  setInterval(() => {

    // Update Every PlayersControls
    Object.entries(controlMap).forEach(([id, control]) => {
      updateVehicleControls(id, control, controlMap);
    });

    // Get World Snapshots Based on User Controls
    const snapshots = stepWorld(controlMap);
    Object.entries(snapshots).forEach(([id, data]) => {
      io.to(id).emit('physicsUpdate', data);

      //   if (typeof channel !== "undefined") {
      //     // default values
      //     let msg = {
      //       id: 0x123,
      //       data: Buffer.from([0xAA, 0xBB, 0xCC])
      //     };

      //     // send data 
      //     var out = {}
      //     var buff = Buffer.alloc(8)

      //     buff.writeUIntBE(data.revs, 0, 4)
      //     buff.writeUIntBE(data.speed, 4, 2)
      //     buff.writeUIntBE(data.fuel, 6, 2)

      //     // console.log('physics', data)
      //     console.log('can', buff)
      //     const now = new Date().toISOString();
      //     const speed = (data.speed).toFixed(1); // assuming speed is m/s
      //     const revs = canData.revs;
      //     const fuelPct = ((canData.fuel / 1023) * 100).toFixed(1); // assuming 10-bit fuel sensor
      //     const gear = canData.gear;

      //     console.log(`[${now}] CAN ID 0x${msg.id.toString(16).toUpperCase()} | RPM: ${revs} | Speed: ${speed} m/s | Fuel: ${fuelPct}% | Gear: ${gear}`);
      //     out.id = msg.id
      //     out.data = buff
      //     const stateFlags = [
      //       control.brake ? 'Brake' : '',
      //       control.headlights ? 'Lights' : '',
      //       control.blinkerLeft ? '←' : '',
      //       control.blinkerRight ? '→' : '',
      //     ].filter(Boolean).join(' | ');

      //     console.log(`[${now}] ... ${stateFlags}`);
      //     channel.send(out);

      //     io.to(id).emit('canData', {
      //       timestamp: Date.now(),
      //       canId: `0x${out.id.toString(16).toUpperCase()}`,
      //       rpm: canData.revs,
      //       speed: +(data.speed * 3.6).toFixed(1),  // km/h
      //       fuel: +((canData.fuel / 1023) * 100).toFixed(1), // percentage
      //       gear: canData.gear,
      //       flags: {
      //         brake: controlMap[id]?.brake ?? false,
      //         lights: controlMap[id]?.headlights ?? false,
      //         leftBlinker: controlMap[id]?.blinkerLeft ?? false,
      //         rightBlinker: controlMap[id]?.blinkerRight ?? false,
      //       }
      //     });
      //   }
    });

  }, 1000 / 60);
}

module.exports = { setupSocketIO };