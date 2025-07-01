// physics/controls.js

const getVehicleConfig = require('../utils/vehicleConfigs');
const { vehicles, gearboxState, fuelState, steeringState, brakeState } = require('./state');
const { resetVehicle } = require('./vehicles');

function updateVehicleControls(id, control, controlMap) {
    const { vehicle } = vehicles[id] || {};
    if (!vehicle) return;

    const config = getVehicleConfig(vehicle.type);

    if (control.reset) resetVehicle(vehicle, controlMap);

    // Reset steering
    vehicle.setSteeringValue(0, 0);
    vehicle.setSteeringValue(0, 1);

    if (control.forward || control.backward) {
        for (let i = 0; i < 4; i++) vehicle.setBrake(0, i);
        brakeState[id] = 0;
    }

    const { gearRatios } = config;
    const gearRatio = gearRatios[gearboxState[id].gear] ?? 1;
    const forwardForce = config.maxForce * (gearRatio / gearRatios[1]);

    const adjustedForce = forwardForce * gearboxState[id].powerMultiplier;
    if (control.forward && gearboxState[id].engineOn && fuelState[id].fuel !== 0) {
        vehicle.applyEngineForce(+adjustedForce, 2);
        vehicle.applyEngineForce(+adjustedForce, 3);
    } else if (control.backward && gearboxState[id].engineOn && fuelState[id].fuel !== 0) {
        vehicle.applyEngineForce(-adjustedForce, 2);
        vehicle.applyEngineForce(-adjustedForce, 3);
    } else {
        vehicle.applyEngineForce(0, 2);
        vehicle.applyEngineForce(0, 3);
    }

    // Steering
    let targetSteer = 0;
    if (control.left) targetSteer = +config.maxSteer;
    else if (control.right) targetSteer = -config.maxSteer;

    const currentSteer = steeringState[id] ?? 0;
    const lerpSpeed = 0.15;
    const newSteer = currentSteer + (targetSteer - currentSteer) * lerpSpeed;

    steeringState[id] = newSteer;
    vehicle.setSteeringValue(newSteer, 0);
    vehicle.setSteeringValue(newSteer, 1);

    // Braking
    const braking = control.brake && !control.forward;
    const targetBrake = braking ? config.maxBrakeForce : 0;
    const currentBrake = brakeState[id] ?? 0;
    const newBrake = currentBrake + (targetBrake - currentBrake) * config.brakeLerpSpeed;
    brakeState[id] = newBrake;

    const frontWheels = [0, 1];
    const rearWheels = [2, 3];

    frontWheels.forEach(i => vehicle.setBrake(newBrake, i));
    rearWheels.forEach(i => vehicle.setBrake(newBrake * 0.8, i));

    if (control.handbrake) {
        rearWheels.forEach(i => vehicle.setBrake(1.5 * config.maxBrakeForce, i));
    }
}

module.exports = { updateVehicleControls };
