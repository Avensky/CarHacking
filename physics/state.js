// physics/state.js

const { world } = require('./world');

const gearboxState = {};
const fuelState = {};
const vehicles = {};
const snapshots = {};
const steeringState = {}; // key: id, value: current steer angle
const brakeState = {}; // key: id, value: current brake force

module.exports = {
    world,
    gearboxState,
    fuelState,
    vehicles,
    snapshots,
    steeringState,
    brakeState
};
