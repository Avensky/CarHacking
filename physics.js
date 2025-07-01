const { Box, Body, Vec3, RaycastVehicle, Cylinder } = require('cannon-es');
const getVehicleConfig = require('./utils/vehicleConfigs');
const { updateEngineState, updateFuelState, updateEngineTemp } = require('./physics/engine.js');
const { vehicles, gearboxState, fuelState } = require('./physics/state.js');
const { world, wheelMaterial } = require('./physics/world');
// state
const steeringState = {}; // key: id, value: current steer angle
const brakeState = {}; // key: id, value: current brake force
const snapshots = {};

// Wheel Config
function createVehicle(id, type) {
  const config = getVehicleConfig(type);

  gearboxState[id] = {
    gear: 0,
    rpm: 0,
    clutchEngaged: false,
    engineOn: false,
    engineStart: false,
    engineStartTime: 0,
    engineShuttingDown: false,
    lastShiftTime: 0,
    _prevGear: 0,
    clutchSlip: 0, // 0 = fully disengaged, 1 = fully locked
    justDownshifted: false,
    engineTemp: config.engineTemp.min,
    overheating: false,
    cooldownStartTime: null,
    lastUpdate: performance.now(), // optional
  };
  steeringState[id] = 0; // Initialize steering angle
  brakeState[id] = 0;
  fuelState[id] = {
    fuel: config.fuelCapacity,
  };

  console.log(`Created ${id}: gear=${gearboxState[id].gear}, rpm=${gearboxState[id].rpm}, clutch=${gearboxState[id].clutchSlip}`);

  const wheelOptions = {
    radius: config.radius,
    directionLocal: config.directionLocal, // Down
    suspensionStiffness: config.suspensionStiffness,
    suspensionRestLength: config.suspensionRestLength,
    frictionSlip: config.frictionSlip,
    dampingRelaxation: config.dampingRelaxation,       // resistance during compression
    dampingCompression: config.dampingCompression,       // resistance on rebound
    maxSuspensionForce: config.maxSuspensionForce,
    maxSuspensionTravel: config.maxSuspensionTravel,
    rollInfluence: config.rollInfluence,
    axleLocal: config.axleLocal, // Left
    chassisConnectionPointLocal: config.chassisConnectionPointLocal, // set below
    isFrontWheel: config.isFrontWheel
  }


  const chassisShape = new Box(new Vec3(config.width / 2, config.height / 2, config.length / 2))


  const { radius, suspensionRestLength, compressionFactor, height } = config;
  const suspensionTravel = suspensionRestLength * compressionFactor;
  const rideHeight = radius + suspensionTravel + height / 2;

  const chassisBody = new Body({
    mass: config.chassisMass,
    position: new Vec3(0, rideHeight, 0),// spawn
    rotation: config.rotation,
    collisionFilterGroup: 1,
    collisionFilterMask: 0,
    // shape: chassisShape
  });

  const shapeOffset = new Vec3(0, -config.height / 2 + config.chassisOffsetY, 0); // <- new
  chassisBody.addShape(chassisShape, shapeOffset);

  const vehicle = new RaycastVehicle({
    chassisBody,
    indexRightAxis: config.indexRightAxis, // X
    indexUpAxis: config.indexUpAxis,    // Y
    indexForwardAxis: config.indexForwardAxis // Z
  });

  const wheelHalfTrack = config.width / 2 - config.wheelHalfTrackOffset
  const wheelBase = config.wheelBase
  const chassisY = config.chassisOffsetY - config.height / 2; // y offset for wheel connection point

  const frontLeft = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(-wheelHalfTrack, chassisY, -wheelBase / 2), isFrontWheel: true
  };
  const frontRight = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(+wheelHalfTrack, chassisY, -wheelBase / 2), isFrontWheel: true
  };
  const rearLeft = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(-wheelHalfTrack, chassisY, +wheelBase / 2), isFrontWheel: false
  };
  const rearRight = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(+wheelHalfTrack, chassisY, +wheelBase / 2), isFrontWheel: false
  };
  vehicle.addWheel(frontLeft);
  vehicle.addWheel(frontRight);
  vehicle.addWheel(rearLeft);
  vehicle.addWheel(rearRight);
  vehicle.addToWorld(world);

  vehicles[id] = { vehicle, chassisBody };
  // Add the wheel bodies
  const wheelBodies = []
  vehicle.wheelInfos.forEach((wheel) => {
    const cylinderShape = new Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const wheelBody = new Body({
      mass: 0,
      material: wheelMaterial,
    })

    wheelBody.type = Body.KINEMATIC
    wheelBody.collisionFilterGroup = 0 // turn off collisions
    // const wheelOrientation = new Quaternion().setFromEuler(0, 0, Math.PI / 2)
    wheelBody.addShape(cylinderShape)
    wheelBodies.push(wheelBody)
    world.addBody(wheelBody)
  })
  return vehicle;
}

function updateVehicleControls(id, control, controlMap) {
  const { vehicle } = vehicles[id] || {};
  if (!vehicle) return;
  // console.log(`Created ${id}: gear=${gearboxState[id].gear}, rpm=${gearboxState[id].rpm}, clutch=${gearboxState[id].clutchSlip}`);
  const config = getVehicleConfig(vehicle.type);

  if (control.reset) {
    resetVehicle(vehicle, controlMap); // reset position to start
  }

  // Reset steering
  vehicle.setSteeringValue(0, 0);
  vehicle.setSteeringValue(0, 1);

  // Reset breaks
  if (control.forward || control.backward) {
    for (let i = 0; i < 4; i++) vehicle.setBrake(0, i);
    brakeState[id] = 0; // reset cached brake state
  }

  const { gearRatios } = config
  const gearRatio = gearRatios[gearboxState[id].gear] ?? 1;
  // Controls
  const forwardForce = config.maxForce * (gearRatio / gearRatios[1]); // normalized to 1st gear

  // Enforce rev limiter
  // if (gearboxState[id].rpm >= maxRpm) {
  //   // simulate cut-off (optional)
  //   vehicle.applyEngineForce(0, 2);
  //   vehicle.applyEngineForce(0, 3);
  // }

  const temp = gearboxState[id].engineTemp;
  // const overheat = config.engineTemp.overheat;
  // const critical = config.engineTemp.critical;

  let powerMultiplier = 1.0;

  // engine damp behavior
  // if (temp >= critical) {
  //   // console.log(`ENGINE BLOCKED: CRITICAL TEMPERATURE for ${id}`);
  //   powerMultiplier = 0;
  // } else if (temp >= overheat) {
  //   const t = (temp - overheat) / (critical - overheat);
  //   powerMultiplier = 1 - 0.5 * t; // fades from 1.0 to 0.5
  //   // console.log(`ENGINE POWER REDUCED: OVERHEAT for ${id}`);
  // }

  // Engine overheating behavior
  if (temp >= config.engineTemp.overheat) {
    console.log(`ENGINE OVERHEATING for ${id}`);
    const t = (temp - config.engineTemp.overheat) /
      (config.engineTemp.critical - config.engineTemp.overheat);
    powerMultiplier = 1 - 0.5 * t; // Fade power by up to 50%
  } else {
    powerMultiplier = 1.0;
  }

  if (temp >= config.engineTemp.critical) {
    powerMultiplier = 0;  // shut off completely
    state.engineShuttingDown = true;
    console.log(`ENGINE CRITICAL: shutting down for ${id}`);
  }

  const adjustedForce = forwardForce * powerMultiplier;

  if (control.forward && gearboxState[id].engineOn && (fuelState[id].fuel !== 0)) {
    vehicle.applyEngineForce(+adjustedForce, 2);
    vehicle.applyEngineForce(+adjustedForce, 3);
  } else if (control.backward && gearboxState[id].engineOn && (fuelState[id].fuel !== 0)) {
    vehicle.applyEngineForce(-adjustedForce, 2);
    vehicle.applyEngineForce(-adjustedForce, 3);
  } else {
    vehicle.applyEngineForce(0, 2);
    vehicle.applyEngineForce(0, 3);
  }

  // steering 
  let targetSteer = 0;
  if (control.left) {
    targetSteer = +config.maxSteer;
  } else if (control.right) {
    targetSteer = -config.maxSteer;
  }

  // Lerp toward target steer
  const currentSteer = steeringState[id] ?? 0;
  const lerpSpeed = 0.15; // Lower = smoother/slower
  const newSteer = currentSteer + (targetSteer - currentSteer) * lerpSpeed;

  steeringState[id] = newSteer;
  vehicle.steeringValue = newSteer
  vehicle.setSteeringValue(newSteer, 0)
  vehicle.setSteeringValue(newSteer, 1)

  const braking = control.brake && !control.forward;
  const targetBrake = braking ? config.maxBrakeForce : 0;

  // Smooth brake force application
  const currentBrake = brakeState[id] ?? 0;
  const newBrake = currentBrake + (targetBrake - currentBrake) * config.brakeLerpSpeed;
  brakeState[id] = newBrake;

  //This mimics rear-wheel braking bias on older cars like the AE86.
  const frontWheels = [0, 1];
  const rearWheels = [2, 3];

  for (const i of frontWheels) {
    vehicle.setBrake(newBrake, i); // light brake on front
  }
  for (const i of rearWheels) {
    vehicle.setBrake(newBrake * 0.8, i); // stronger rear brake
    // gearboxState[id].rpm -= (gearboxState[id].rpm) * 0.02; // drag RPM back toward wheel RPM
  }
  // for handbrake
  if (control.handbrake) {
    rearWheels.forEach(i => vehicle.setBrake(1.5 * config.maxBrakeForce, i));
  }
}




// console.log(world.bodies.length)
// world.bodies.forEach(body => console.log(body.id, body.shapes, body.position))

function resetVehicle(vehicle, controlMap) {
  // Reset chassis position & velocity
  vehicle.chassisBody.velocity.setZero();
  vehicle.chassisBody.angularVelocity.setZero();
  vehicle.chassisBody.position.set(0, .25, 0);
  vehicle.chassisBody.quaternion.set(0, 0, 0, 1);
  vehicle.chassisBody.force.setZero();
  vehicle.chassisBody.torque.setZero();
  vehicle.chassisBody.wakeUp();

  // Reset suspension for all wheels
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    const wheel = vehicle.wheelInfos[i];
    wheel.suspensionLength = wheel.suspensionRestLength;
    vehicle.updateWheelTransform(i);         // VERY important
  }

  // Force re-evaluation of suspension
  vehicle.updateSuspension();

  const id = Object.keys(vehicles).find((key) => vehicles[key].vehicle === vehicle);
  const config = getVehicleConfig(vehicle.type);
  if (id) {
    // ✅ Reset gearbox state
    if (gearboxState[id]) {
      gearboxState[id] = {
        gear: 0,
        rpm: 0,
        engineOn: false,
        engineStarting: false,
        engineShuttingDown: false,
        clutchSlip: 0,
        clutchEngaged: false,
        _prevGear: 0,
        engineTemp: config.engineTemp.min,
        overheating: false,
        cooldownStartTime: null,
        shutdown: false,
        lastUpdate: performance.now(), // optional
      };
    }

    // ✅ Reset control state
    if (controlMap[id]) {
      controlMap[id].engineOn = false;
      controlMap[id].reset = false;
      // controlMap[id].forward = false;
      // controlMap[id].brake = false;
      // controlMap[id].backward = false;
      // controlMap[id].left = false;
      // controlMap[id].right = false;
    }
    console.log(`Vehicle ${id} fully reset: controls + gearbox`);
  }
}


function stepWorld(controlMap = {}) {
  world.step(1 / 60);

  // Update all vehicles
  for (const [id, { vehicle, chassisBody }] of Object.entries(vehicles)) {

    const config = getVehicleConfig(vehicle.type);
    const state = gearboxState[id];
    const control = controlMap[id] || {};
    const now = Date.now();

    updateEngineState(id, state, config, control, chassisBody, now, fuelState[id]);
    updateFuelState(id, state, config, control, fuelState[id]);
    updateEngineTemp(id, state, config, control);
    // updateClutch(id, state, control);

    //-------------------------- OLD CODE ----------------------------//

    const {
      gearRatios,
      finalDrive,
      idleRpm,
      maxRpm,
      shiftUpRpm,
      shiftDownRpm
    } = config;

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
module.exports = { createVehicle, updateVehicleControls, stepWorld };