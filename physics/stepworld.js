const { updateEngineState, updateFuelState, updateEngineTemp, updatePowerMultiplier } = require('./engine.js');
const getVehicleConfig = require('../utils/vehicleConfigs');
const { vehicles, gearboxState, fuelState } = require('./state.js');
const { world } = require('./world');

const snapshots = {};
function stepWorld(controlMap = {}) {
    world.step(1 / 60);

    // Update all vehicles
    for (const [id, { vehicle, chassisBody }] of Object.entries(vehicles)) {

        const config = getVehicleConfig(vehicle.type);
        const state = gearboxState[id];
        const control = controlMap[id] || {};
        const now = Date.now();

        updatePowerMultiplier(id, state, config);
        updateEngineState(id, state, config, control, chassisBody, now, fuelState[id]);
        updateFuelState(id, state, config, control, fuelState[id]);
        updateEngineTemp(id, state, config, control);
        // updateClutch(id, state, control);

        const { gearRatios, finalDrive, idleRpm, maxRpm, shiftUpRpm, shiftDownRpm } = config;

        const speed = chassisBody.velocity.length();

        // Turn on first gear when controls move forward
        // if (state.engineOn && state.gear === 0 && (control.forward || control.backward) && (fuelState[id].fuel !== 0)) {
        if (control.engineOn && state.engineOn && state.gear === 0 && (control.forward || control.backward)) {
            state.gear = 1;
            state.clutchEngaged = true;
            state._prevGear = 0;
            console.log(`Gear engaged to 1 for ${id}`);
        }

        const effectiveRatio = gearRatios[state.gear] * finalDrive;
        // simulate rpms while gears are engaged
        if (state.engineOn && state.gear !== 0 && (fuelState[id].fuel !== 0)) {
            if (control.forward || control.backward && (fuelState[id].fuel !== 0)) {
                // Increase RPMs as speed increases
                const speedRatio = Math.min(chassisBody.velocity.length() / config.maxSpeed, 1);

                // Gear Ratio Weighting
                const normalizedRatio = effectiveRatio / gearRatios[1]; // relative to 1st gear
                const rpmTarget = idleRpm + (maxRpm - idleRpm) * Math.pow(speedRatio * normalizedRatio, 0.5);
                const rpmResponsiveness = 0.1; // increase from 0.1 to 0.3
                state.rpm += (rpmTarget - state.rpm) * rpmResponsiveness;

            } else if (control.brake && (fuelState[id].fuel !== 0)) {
                // Let RPM settle toward wheel-driven RPM (simulating engine braking)
                // Simulate engine braking, but do not drop below idle RPM
                const wheelRpm = (speed * effectiveRatio * 60) / (2 * Math.PI);
                const decelRate = 0.05;
                const target = Math.max(idleRpm, wheelRpm);
                state.rpm += (target - state.rpm) * decelRate;
            } else { //cruising
                const wheelRpm = (speed * effectiveRatio * 60) / (2 * Math.PI);
                const decelRate = 0.005;

                const target = Math.max(idleRpm, wheelRpm);
                state.rpm += (target - state.rpm) * decelRate;

            }
            // If in no in gear and idle, add light rpm fluctuation to simulate torque converter drag
            if ((!control.forward && !control.backward) && (fuelState[id].fuel !== 0)) {
                const torqueFluctuation = Math.sin(now * 0.01 + id.length) * 40; // small wiggle
                state.rpm += torqueFluctuation * 0.1; // dampen the effect
            }
        }


        // Smooth fade if overheated:
        if (state.engineOn && state.engineTemp >= config.engineTemp.overheat && state.engineTemp < config.engineTemp.critical) {
            const safeRpm = config.idleRpm;
            const fadeRate = 0.02;
            state.rpm += (safeRpm - state.rpm) * fadeRate;
        }

        // Automatic gear shifting with hysteresis and rpm
        if (!state.lastShiftTime) state.lastShiftTime = 0;
        const timeSinceLastShift = now - state.lastShiftTime;

        if (state.gear > 0 && timeSinceLastShift > 1000) {
            const rpm = state.rpm;
            const nextGear = state.gear + 1;
            const prevGear = state.gear - 1;

            // const upSpeed = config.shiftUpSpeeds[state.gear] || Infinity;
            const downSpeed = config.shiftDownSpeeds[state.gear];

            const shouldUpshift = nextGear < config.gearRatios.length && (rpm > shiftUpRpm);
            // (rpm > config.shiftUpRpm || speed > upSpeed);

            const shouldDownshift =
                prevGear >= 0 &&
                (rpm < shiftDownRpm && speed < downSpeed);

            if (shouldUpshift) {
                console.log(`Upshifting ${id}: ${state.gear} → ${nextGear}`);
                state._prevGear = state.gear;
                state.gear = nextGear;
                state.lastShiftTime = now;
                state.rpm -= 3000;
            } else if (shouldDownshift) {

                // Find best gear for current speed (speed in m/s)
                let bestGear = 0;
                for (let g = config.shiftDownSpeeds.length - 1; g > 0; g--) {
                    if (speed >= config.shiftDownSpeeds[g]) {
                        bestGear = g;
                        break;
                    }
                }

                // Only shift if better than current
                if (bestGear < state.gear) {
                    console.log(`Downshifting ${id}: ${state.gear} → ${bestGear}`);
                    state._prevGear = state.gear;
                    state.gear = bestGear;
                    state.lastShiftTime = now;

                    // Optional: simulate rev match jump
                    const ratioBefore = gearRatios[state._prevGear] * finalDrive;
                    const ratioAfter = gearRatios[state.gear] * finalDrive;
                    const rpmBoost = state.rpm * (ratioAfter / ratioBefore);
                    state.rpm = Math.min(rpmBoost, config.maxRpm);
                }
            }
        }

        // Automatic clutch logic
        const isShifting = state._prevGear !== state.gear;
        const isTryingToLaunch = control.forward && speed < 1;
        const shouldDisengage = !state.engineOn || isShifting || isTryingToLaunch;

        if (shouldDisengage) {
            state.clutchEngaged = false;
            const bitePoint = 0.3; // partial slip during launch or shift
            state.clutchSlip += (bitePoint - state.clutchSlip) * 0.15;
        } else {
            state.clutchEngaged = true;
            state.clutchSlip += (1.0 - state.clutchSlip) * 0.1; // smoothly lock
        }


        // // Simulate engine braking when decelerating in gear
        // const isDecelerating = !control.forward && !control.backward && state.engineOn;
        // const isInGear = state.gear > 0;
        // const clutchIsLocked = state.clutchSlip > 0.95; // engine and wheels tightly linked

        // if (isInGear && isDecelerating) {
        //   const engineBraking = .1 * config.maxBrakeForce * (state.rpm / config.maxRpm);
        //   console.log(`Engine Braking for ${id}: Gear ${state.gear}, RPM ${Math.round(state.rpm)}, Brake ${engineBraking.toFixed(2)}`);

        //   // Directly set brake on rear wheels
        //   vehicle.wheelInfos[2].brake = engineBraking;
        //   vehicle.wheelInfos[3].brake = engineBraking;
        // }

        // send physics snapshot to frontend
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
module.exports = { stepWorld };