const { createVehicle, stepWorld, updateVehicleInputs } = require('./physics');

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
const inputs = {};

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    inputs[socket.id] =
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
    }

    socket.on('spawnPlayer', (data) => {
      console.log(data);
      socket.emit('spawnPlayer', data);
      createVehicle(socket.id, data.vehicle);
    });



    socket.on('controls', (data) => {
      // console.log(data);
      inputs[socket.id] = data;
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      delete inputs[socket.id];
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
    Object.entries(inputs).forEach(([id, control]) => {
      updateVehicleInputs(id, control);
    });

    const snapshots = stepWorld();
    Object.entries(snapshots).forEach(([id, data]) => {
      io.to(id).emit('physicsUpdate', data);

      if (typeof channel !== "undefined") {
        // default values
        let msg = {
          id: 0x123,
          data: Buffer.from([0xAA, 0xBB, 0xCC])
        };

        const canData = {
          speed: 0,
          revs: 0,
          up: true,
          fuel: 500,
          gear: 1,
          index: 0,
        }

        // send data 
        var out = {}
        var buff = Buffer.alloc(8)

        buff.writeUIntBE(canData.revs, 0, 4)
        buff.writeUIntBE(data.speed, 4, 2)
        buff.writeUIntBE(canData.fuel, 6, 2)

        // console.log('physics', data)
        console.log('can', buff)
        out.id = msg.id
        out.data = buff
        channel.send(out);
      }

      io.to(id).emit('canData', {
        id: out.id,
        data: Array.from(buff), // easier to send over WebSocket
      });
    });
  }, 1000 / 60);
}

module.exports = { setupSocketIO };