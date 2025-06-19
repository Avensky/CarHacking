const { createVehicle, stepWorld, updateVehicleControls } = require('./physics');

let channel
if (process.env.NODE_ENV === "production") {
  const can = require("socketcan");
  // sudo apt-get install can-utils
  // sudo modprobe vcan
  // sudo ip link add dev vcan0 type vcan
  // sudo ip link set up vcan0

  channel = can.createRawChannel("vcan0", true);
  channel.addListener("onMessage", msg => {
    console.log("Received CAN:", msg);
  });
  channel.start();

}
const controlMap = {};

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

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
      console.log(data);
      socket.emit('spawnPlayer', data);
      createVehicle(socket.id, data.vehicle);
    });



    socket.on('controls', (data) => {
      console.log(data.engineOn);
      controlMap[socket.id] = data;
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      delete controlMap[socket.id];
    });
  });

  // Add Meaningful CAN ID Mapping
  // You can differentiate between message types using different CAN IDs:
  // ID	Purpose
  // 0x101	Speed/Revs
  // 0x102	Fuel + Gear
  // 0x103	Blinker State
  // 0x104	Diagnostics

  setInterval(() => {
    Object.entries(controlMap).forEach(([id, control]) => {
      updateVehicleControls(id, control);
    });

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