// physics/state.js

const { World } = require('cannon-es');

const world = new World();
world.gravity.set(0, -9.82, 0);

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
