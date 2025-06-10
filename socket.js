const { createVehicle, stepWorld, updateVehicleInputs } = require('./physics');

const inputs = {};

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    //eslint-disable-next-line

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

    socket.on('spawnVehicle', (data) => {
      console.log(data);
      const vehicle = createVehicle(socket.id, data);
    });
    socket.on('controls', (data) => {
      console.log(data);
      inputs[socket.id] = data;
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      delete inputs[socket.id];
    });
  });

  setInterval(() => {
    Object.entries(inputs).forEach(([id, control]) => {
      updateVehicleInputs(id, control);
    });

    const snapshots = stepWorld();
    Object.entries(snapshots).forEach(([id, data]) => {
      io.to(id).emit('physicsUpdate', data);
    });
  }, 1000 / 60);
}

module.exports = { setupSocketIO };