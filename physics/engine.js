// engine.js

function updateEngineState(id, state, config, control, chassisBody, now, fuelState) {
    // console.log('chassisBody', chassisBody);
    // Clamp gear
    if (state.gear >= config.gearRatios.length) state.gear = 0;
    if (state.gear < 0) state.gear = 0;

    const speed = chassisBody.velocity.length();
    const effectiveRatio = config.gearRatios[state.gear] * config.finalDrive;

    // Handle startup - engine crank
    if (control.engineOn && !state.engineOn && !state.engineStarting && !state.engineShuttingDown && (state.engineTemp < config.engineTemp.overheat)) {
        state.engineStarting = true;
        state.engineStartTime = now;
        state.rpm = 300;
        console.log(`Engine cranking for ${id}`); // TODO: Simulate Canbus
    }

    if (state.engineStarting) {
        // Cranking RPMs during startup
        const elapsed = now - state.engineStartTime;
        const crankPulse = Math.sin(now * 0.02 + id.length) * 150;
        state.rpm = 300 + crankPulse;

        // Idle after 1.3s delay
        if (elapsed > 1300) {
            // state.engineStarting = false; // recommended by ai
            if (fuelState.fuel !== 0) {
                state.engineOn = true; // turn the engine on
                state.rpm = config.idleRpm;
            }
            state.engineStarting = false; // current position, shuts engine off if no fuel
        }
    }

    // Handle Shutdown
    // If User Signals Shutdown, Handle The Physics
    if (!control.engineOn && state.engineOn || (state.engineTemp > config.engineTemp.overheat)) {
        state.engineOn = false;
        state.engineShuttingDown = true;
        console.log(`Engine shutting down on for ${id}`); // TODO: Simulate Can Bus
    }

    // Decay Rpms Gradually
    if (state.engineShuttingDown) {
        state.rpm = Math.max(0, state.rpm - 15); // reduce 25 rpm per frame (~1500rpm in 1 sec at 60fps)
        if (state.rpm === 0) {
            state.engineShuttingDown = false;
            // state.gear = 0; // Set Gear to Neutral
            console.log(`Engine fully off for ${id}`);
        }
    }

    // RPM scaling in gear
    if (state.engineOn && state.gear !== 0 && (fuelState.fuel > 0)) { // OLD LOGIC
        if (control.forward || control.backward && (fuelState.fuel > 0)) { //OLD LOGIC
            // if (state.engineOn && state.gear !== 0) { // Ai recommended
            // Normal RPM increase with speed
            const speedRatio = Math.min(speed / config.maxSpeed, 1);
            const normalizedRatio = effectiveRatio / config.gearRatios[1];
            const rpmTarget = config.idleRpm + (config.maxRpm - config.idleRpm) * Math.pow(speedRatio * normalizedRatio, 0.5);
            const rpmResponsiveness = 0.1;
            state.rpm += (rpmTarget - state.rpm) * rpmResponsiveness;
        }
    }

    // Idle behavior
    if (state.gear === 0 && state.engineOn && (fuelState.fuel !== 0)) {
        // if (state.gear === 0 && state.engineOn) { // AI recommended
        const fluctuation = Math.sin(now * 0.01 + id.length) * 50; // wiggle ±50 rpm
        state.rpm = config.idleRpm + fluctuation;
    }
}

function updateFuelState(id, state, config, control, fuelState) {
    if (state.engineOn && fuelState.fuel > 0) {
        const gearMultiplier = state.gear > 0 ? state.gear : 1; // Burn Higher at Higher Gears
        const rpmFactor = state.rpm / config.maxRpm; // Higher Burn at Higher Rpms
        const throttle = control.forward || control.backward ? 1 : 0.2; // Higher Burn Under Load
        const burn = config.baseConsumption * rpmFactor * throttle * gearMultiplier;
        fuelState.fuel = Math.max(0, fuelState.fuel - burn); // Fuel Burn

        // Engine Runs Out of Fuel, Shut it off
        if (fuelState.fuel <= 0) {
            state.engineShuttingDown = true;
            console.log(`Fuel empty — engine shutting off for ${id}`);
        }

        // if (control.refuel) {
        //     fuel.fuel = Math.min(1.0, fuel + 0.01); // simulate refueling
        // }
    }
}

function updateEngineTemp(id, state, config, control) {
    const tempCfg = config.engineTemp;

    if (state.engineOn) {
        const isUnderLoad = control.forward || control.backward;
        const rpmFactor = state.rpm / config.maxRpm;

        if (isUnderLoad) {
            // Base heat plus extra if high RPM
            state.engineTemp += tempCfg.heatRate * (1 + rpmFactor * 0.5);
        } else {
            // Idling or coasting = light heat
            state.engineTemp += tempCfg.heatRate * 0.1;
        }

        // Cooling effect when moving faster (airflow!)
        const speed = state.speed || 0; // you can pass speed in
        const airflowCooling = speed * 0.001; // tweak this
        state.engineTemp -= airflowCooling;

    } else {
        // Passive cooling when off
        state.engineTemp -= tempCfg.coolRate * 2;
    }

    // Clamp to min/critical
    state.engineTemp = Math.max(tempCfg.min, Math.min(tempCfg.critical, state.engineTemp));


    // // Engine overheating behavior
    // if (state.engineTemp >= config.engineTemp.overheat) {
    //     console.log(`ENGINE OVERHEATING for ${id}`);
    //     const t = (state.engineTemp - config.engineTemp.overheat) /
    //         (config.engineTemp.critical - config.engineTemp.overheat);
    //     powerMultiplier = 1 - 0.5 * t; // Fade power by up to 50%
    // } else {
    //     powerMultiplier = 1.0;
    // }

    // if (state.engineTemp >= config.engineTemp.critical) {
    //     powerMultiplier = 0;  // shut off completely
    //     state.engineShuttingDown = true;
    //     console.log(`ENGINE CRITICAL: shutting down for ${id}`);
    // }

    // state.engineOn = false;
    // state.engineShuttingDown = false;
}

function updateGearShiftState(id, state, config, control, speed, now) {
    const { gearRatios, finalDrive, shiftUpRpm, shiftDownRpm, shiftDownSpeeds } = config;

    // Engage First Gear
    if (control.engineOn && state.engineOn && state.gear === 0 && (control.forward || control.backward)) {
        state.gear = 1;
        state.clutchEngaged = true;
        state._prevGear = 0;
        console.log(`Gear engaged to 1 for ${id}`);
    }

    // Shift Delay Timer
    if (!state.lastShiftTime) state.lastShiftTime = 0;
    const timeSinceLastShift = now - state.lastShiftTime;


    if (state.gear > 0 && timeSinceLastShift > 1000) {
        const rpm = state.rpm;
        const nextGear = state.gear + 1;
        const prevGear = state.gear - 1;

        const shouldUpshift = nextGear < gearRatios.length && rpm > shiftUpRpm;
        const shouldDownshift = prevGear >= 0 && rpm < shiftDownRpm && speed < shiftDownSpeeds[state.gear];

        if (shouldUpshift) {
            console.log(`Upshifting ${id}: ${state.gear} → ${nextGear}`);
            state._prevGear = state.gear;
            state.gear = nextGear;
            state.lastShiftTime = now;
            state.rpm -= 3000; // optional rpm drop
        } else if (shouldDownshift) {
            let bestGear = 0;
            for (let gear = shiftDownSpeeds.length - 1; gear > 0; gear--) {
                if (speed >= shiftDownSpeeds[gear]) {
                    bestGear = gear;
                    break;
                }
            }

            if (bestGear < state.gear) {
                console.log(`Downshifting ${id}: ${state.gear} → ${bestGear}`);
                state._prevGear = state.gear;
                state.gear = bestGear;
                state.lastShiftTime = now;

                const ratioBefore = gearRatios[state._prevGear] * finalDrive;
                const ratioAfter = gearRatios[state.gear] * finalDrive;
                const rpmBoost = state.rpm * (ratioAfter / ratioBefore);
                state.rpm = Math.min(rpmBoost, config.maxRpm);
            }
        }
    }
}

function updateClutchState(id, state, control, speed) {
    const isShifting = state._prevGear !== state.gear;
    const isTryingToLaunch = control.forward && speed < 1;
    const shouldDisengage = !state.engineOn || isShifting || isTryingToLaunch;

    if (shouldDisengage) {
        state.clutchEngaged = false;
        const bitePoint = 0.3; // partial slip
        state.clutchSlip += (bitePoint - state.clutchSlip) * 0.15;
    } else {
        state.clutchEngaged = true;
        state.clutchSlip += (1.0 - state.clutchSlip) * 0.1; // lock up smoothly
        console.log(`ClutchSlip=${state.clutchSlip.toFixed(2)} ${id}: Gear=${state.gear}`);
    }
}

function updateEngineRPM(id, state, config, control, speed, now) {
    const { gearRatios, finalDrive, idleRpm, maxRpm } = config;

    const effectiveRatio = gearRatios[state.gear] * finalDrive;
    if (state.engineOn && state.fuel > 0) {
        if (state.gear !== 0) {
            // If in gear: link to wheel speed
            const speedRatio = Math.min(speed / config.maxSpeed, 1);
            const normalizedRatio = effectiveRatio / gearRatios[1];
            const rpmTarget = idleRpm + (maxRpm - idleRpm) * Math.pow(speedRatio * normalizedRatio, 0.5);
            const rpmResponsiveness = 0.1;
            state.rpm += (rpmTarget - state.rpm) * rpmResponsiveness;
        } else {
            // Neutral or clutch disengaged: idle wiggle
            const fluctuation = Math.sin(now * 0.01 + id.length) * 50;
            state.rpm += (config.idleRpm - state.rpm) * 0.05 + fluctuation * 0.05;
        }
    } else {
        // Engine off or out of fuel: decay RPM to zero
        state.rpm -= state.rpm * 0.05;
        if (state.rpm < 1) state.rpm = 0;
    }
    // if (state.engineOn && state.gear !== 0 && state.fuel > 0) {
    //     if (control.forward || control.backward) {
    //         // Increase RPMs as speed increases
    //         const speedRatio = Math.min(speed / config.maxSpeed, 1);

    //         // Gear Ratio Weighting
    //         const normalizedRatio = effectiveRatio / gearRatios[1]; // relative to 1st gear
    //         const rpmTarget = idleRpm + (maxRpm - idleRpm) * Math.pow(speedRatio * normalizedRatio, 0.5);
    //         const rpmResponsiveness = 0.1;
    //         state.rpm += (rpmTarget - state.rpm) * rpmResponsiveness;

    //     } else if (control.brake) {
    //         // Engine braking effect: RPM settles toward wheel RPM but not below idle
    //         const wheelRpm = (speed * effectiveRatio * 60) / (2 * Math.PI);
    //         const decelRate = 0.05;
    //         const target = Math.max(idleRpm, wheelRpm);
    //         state.rpm += (target - state.rpm) * decelRate;

    //     } else {
    //         // Cruising, light drag
    //         const wheelRpm = (speed * effectiveRatio * 60) / (2 * Math.PI);
    //         const decelRate = 0.005;
    //         const target = Math.max(idleRpm, wheelRpm);
    //         state.rpm += (target - state.rpm) * decelRate;

    //         // Add slight torque converter wiggle
    //         const fluctuation = Math.sin(now * 0.01 + id.length) * 40;
    //         state.rpm += fluctuation * 0.1;
    //     }
    // }
}

module.exports = {
    updateEngineState,
    updateFuelState,
    updateEngineTemp,
    updateGearShiftState,
    updateClutchState,
    updateEngineRPM
};