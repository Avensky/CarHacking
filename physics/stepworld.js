// physics/stepworld.js

const { world, vehicles, gearboxState, fuelState, snapshots } = require('./state');
const getVehicleConfig = require('../utils/vehicleConfigs');
const {
    updateEngineState,
    updateFuelState,
    updateEngineTemp,
    updateGearShiftState,
    updateClutchState,
    updateEngineRPM
} = require('./engine');

function stepWorld(controlMap = {}) {
    world.step(1 / 60);

    for (const [id, { vehicle, chassisBody }] of Object.entries(vehicles)) {
        const state = gearboxState[id];
        const config = getVehicleConfig(vehicle.type);
        const control = controlMap[id] || {};
        const speed = chassisBody.velocity.length();
        const now = Date.now();

        updateEngineState(id, state, config, control, chassisBody, fuelState[id], now);
        updateEngineRPM(id, state, config, control, speed, now);
        updateFuelState(id, state, config, control, fuelState[id]);
        updateEngineTemp(id, state, config, control);
        updateGearShiftState(id, state, config, control, speed, now);
        updateClutchState(id, state, control, speed);

        snapshots[id] = {
            chassisBody: {
                position: { ...chassisBody.position },
                quaternion: { ...chassisBody.quaternion },
            },
            wheelInfos: vehicle.wheelInfos.map(wheel => ({
                position: { ...wheel.worldTransform.position },
                quaternion: { ...wheel.worldTransform.quaternion },
            })),
            speed: chassisBody.velocity.length() * 2.24, //convert to mph
            rpm: state.rpm,
            gear: state.gear,
            fuel: fuelState[id].fuel,
            temp: state.engineTemp
            // engineStarting: state.engineStarting,
            // steeringValue: vehicle.steeringValue,
        };
    }

    return snapshots;
}

module.exports = stepWorld;
