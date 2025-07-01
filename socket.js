// socket.js
const { stepWorld, createVehicle, updateVehicleControls } = require('./physics/index');
// const { createVehicle } = require('./physics/vehicles');
// const { updateVehicleControls } = require('./physics/controls');
const getVehicleConfig = require('./utils/vehicleConfigs');

// Connect to Socketcan on Production (Linux)
let channel;
if (process.env.NODE_ENV === "production") {
  const can = require("socketcan");
  channel = can.createRawChannel("vcan0", true);
  channel.addListener("canData", msg => console.log("Received CAN:", msg));
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

      // Send Raw Can Data
      if (typeof channel !== "undefined") {
        // RPM
        const rpmBuffer = Buffer.alloc(2);
        rpmBuffer.writeUInt16BE(Math.round(data.rpm));
        let msg = { id: 0x100, data: rpmBuffer }
        channel.send(msg);

        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: rpmBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // Speed
        const speedBuffer = Buffer.alloc(2);
        speedBuffer.writeUInt16BE(Math.round(data.speed * 100));
        msg = { id: 0x101, data: speedBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: speedBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // Gear
        const gearBuffer = Buffer.alloc(1);
        gearBuffer.writeUInt8(data.gear);
        msg = { id: 0x102, data: gearBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: gearBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // Fuel
        const fuelPct = Math.min(Math.max(data.fuel * 255, 0), 255);
        const fuelBuffer = Buffer.alloc(1);
        fuelBuffer.writeUInt8(Math.round(fuelPct));
        msg = { id: 0x103, data: fuelBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: fuelBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // Engine Temp
        const tempBuffer = Buffer.alloc(1);
        const tempScaled = Math.round(Math.min(Math.max(data.temp * 2, 0), 255));
        tempBuffer.writeUInt8(tempScaled);
        msg = { id: 0x104, data: tempBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: fuelBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // ✅ Blinkers + Hazards combined
        const blinkerState =
          (controlMap[id]?.blinkerLeft ? 1 : 0) |
          (controlMap[id]?.blinkerRight ? 2 : 0) |
          (controlMap[id]?.hazards ? 4 : 0);
        const blinkersBuffer = Buffer.alloc(1);
        blinkersBuffer.writeUInt8(blinkerState);
        msg = { id: 0x105, data: blinkersBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: blinkersBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // ✅ EngineOn
        const engineOnBuffer = Buffer.alloc(1);
        engineOnBuffer.writeUInt8(controlMap[id]?.engineOn ? 1 : 0);
        msg = { id: 0x106, data: engineOnBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: engineOnBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // ✅ Headlights
        const headlightsBuffer = Buffer.alloc(1);
        headlightsBuffer.writeUInt8(controlMap[id]?.headlights ? 1 : 0);
        msg = { id: 0x107, data: headlightsBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: headlightsBuffer.toString('hex'),
          timestamp: Date.now()
        });

        // ✅ Radio
        const radioBuffer = Buffer.alloc(1);
        radioBuffer.writeUInt8(controlMap[id]?.radio ? 1 : 0);
        msg = { id: 0x108, data: radioBuffer }
        channel.send(msg);
        io.to(id).emit('canData', {
          canId: `0x${msg.id.toString(16).toUpperCase()}`,
          data: radioBuffer.toString('hex'),
          timestamp: Date.now()
        });

        console.log(`[CAN] RPM:${data.rpm} Speed:${data.speed.toFixed(2)} Gear:${data.gear} Fuel:${fuelPct} Blinkers:${blinkerState} EngineOn:${controlMap[id]?.engineOn ? 1 : 0} Headlights:${controlMap[id]?.headlights ? 1 : 0} Radio:${controlMap[id]?.radio ? 1 : 0}`);
      }

    });

  }, 1000 / 60);
}

module.exports = { setupSocketIO };