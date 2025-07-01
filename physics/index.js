// physics/index.js

const { createVehicle, resetVehicle } = require('./vehicles');
const { updateVehicleControls } = require('./controls');
const { stepWorld } = require('./stepworld');

module.exports = {
    createVehicle,
    resetVehicle,
    updateVehicleControls,
    stepWorld
};
