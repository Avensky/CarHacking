const { World, Body, Box, Vec3, RaycastVehicle, Material, Cylinder, ContactMaterial, Plane, Quaternion } = require('cannon-es');
const getVehicleConfig = require('./utils/vehicleConfigs');
// world
const world = new World();
world.gravity.set(0, -9.82, 0);

// Create a new material for the ground (optional)
const groundMaterial = new Material('groundMaterial');

// Create the ground plane
const groundShape = new Plane();
const groundBody = new Body({
  mass: 0, // static body, doesn't move
  material: groundMaterial,
});

// Add the plane shape to the body
groundBody.addShape(groundShape);

// Rotate the plane so it lies flat along the y-axis
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

// const normal = new Vec3(0, 0, 1) // default normal of Plane
// normal.applyQuaternion(groundBody.quaternion)
// console.log("Ground normal in world space:", normal)
groundBody.position.set(0, 0, 0);
// Add the body to the world
world.addBody(groundBody);

// Define interactions between wheels and ground
// Wheel Ground
const friction = 0.6
const restitution = 0
const contactEquationStiffness = 1e6
const contactEquationRelaxation = 3

const wheelMaterial = new Material('wheel')
const wheel_ground = new ContactMaterial(wheelMaterial, groundMaterial, {
  friction: friction,
  restitution: restitution,
  contactEquationStiffness: contactEquationStiffness,
  contactEquationRelaxation: contactEquationRelaxation,
})
world.addContactMaterial(wheel_ground)

// state
const steeringState = {}; // key: id, value: current steer angle
const gearboxState = {};
const brakeState = {}; // key: id, value: current brake force
const snapshots = {};
const fuelState = {}; // key: id, value: { fuel: number }
const vehicles = {};// store all vehicles

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
    engineTemp: config.engineTemp.min,
    justDownshifted: false
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
  const overheat = config.engineTemp.overheat;
  const critical = config.engineTemp.critical;

  let powerMultiplier = 1.0;

  if (temp >= critical) {
    // console.log(`ENGINE BLOCKED: CRITICAL TEMPERATURE for ${id}`);
    powerMultiplier = 0;
  } else if (temp >= overheat) {
    const t = (temp - overheat) / (critical - overheat);
    powerMultiplier = 1 - 0.5 * t; // fades from 1.0 to 0.5
    // console.log(`ENGINE POWER REDUCED: OVERHEAT for ${id}`);
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
  // vehicle.chassisBody.rotation.set(0, 5, 0)
  // vehicle.chassisBody.position.set(0, 7, 0) //reset position
  // const q = new Quaternion()
  // q.setFromEuler(0, Math.PI / 2, 0)
  // vehicle.chassisBody.quaternion.copy(q)
  // vehicle.chassisBody.velocity.set(0, 0, 0)
  // vehicle.chassisBody.angularVelocity.set(0, 0, 0)

  // Reset chassis position & velocity
  vehicle.chassisBody.velocity.setZero();
  vehicle.chassisBody.angularVelocity.setZero();
  vehicle.chassisBody.position.set(0, .85, 0);
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
    // config
    const control = controlMap[id] || {};
    const config = getVehicleConfig(vehicle.type);
    const state = gearboxState[id];

    // clamp gear between 0 and max
    if (state.gear >= config.gearRatios.length) state.gear = 0;
    if (state.gear < 0) state.gear = 0;

    const {
      gearRatios,
      finalDrive,
      idleRpm,
      maxRpm,
      shiftUpRpm,
      shiftDownRpm
    } = config;

    // const gearRatio = gearRatios[state.gear] ?? 1;
    // const slipLerpSpeed = 0.1;
    // const idleThrottle = 0.25; // when clutch disengaged, engineValue fallback

    // get physics data
    const chassis = {
      position: { ...chassisBody.position },
      quaternion: { ...chassisBody.quaternion },
    };

    const wheelInfos = vehicle.wheelInfos.map(w => ({
      position: { ...w.worldTransform.position },
      quaternion: { ...w.worldTransform.quaternion },
    }));

    const speed = chassisBody.velocity.length();
    const fuel = fuelState[id];
    const now = Date.now();





    // Simulate engine crank
    if (control.engineOn && !state.engineOn && !state.engineStarting && !state.engineShuttingDown) {
      // if (control.startEngine && !state.engineOn && !state.engineStarting && !state.engineShuttingDown) {
      state.engineStarting = true;
      state.engineStartTime = now;
      state.rpm = 300; // cranking sound
      console.log(`Engine cranking for ${id}`);
    }



    // Simulate engine starting with delay
    if (state.engineStarting) {
      const elapsed = now - state.engineStartTime;

      // Animate cranking RPMs during startup
      const crankPulse = Math.sin(now * 0.02 + id.length) * 150;
      state.rpm = 300 + crankPulse;

      if (elapsed > 1300) { // 1.3 second delay
        if (fuel.fuel !== 0) {
          state.engineOn = true; // turn the engine on
          state.rpm = config.idleRpm;
          console.log(`Engine turned on for ${id}`);
        }
        state.engineStarting = false;
      }
    }





    // simulate idle rmps in neutral
    if (state.gear === 0 && state.engineOn && (fuelState[id].fuel !== 0)) {
      const fluctuation = Math.sin(now * 0.01 + id.length) * 50; // wiggle ±50 rpm
      state.rpm = config.idleRpm + fluctuation;
    }






    // simulate engine shut off 
    if (!control.engineOn) {
      if (state.engineOn) {
        // engine is being turned off
        state.engineOn = false;
        state.engineShuttingDown = true;
        console.log(`Engine shutting down on for ${id}`);
      }

      if (state.engineShuttingDown) {
        // decay rpm gradually
        state.rpm = Math.max(0, state.rpm - 25); // reduce 50 rpm per frame (~3000rpm in 1 sec at 60fps)
        if (state.rpm === 0) {
          state.engineShuttingDown = false;
          state.gear = 0; // ✅ RESET GEAR TO NEUTRAL
          console.log(`Engine fully off, gear reset to 0 for ${id}`);
        }
      }
    }





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


    if (fuelState[id].fuel === 0) {
      state.rpm -= (state.rpm) * 0.005;
    }









    // Automatic gear shifting with hysteresis and rpm
    if (!state.lastShiftTime) state.lastShiftTime = 0;
    const timeSinceLastShift = now - state.lastShiftTime;

    if (state.engineOn && state.gear > 0 && timeSinceLastShift > 1000) {
      const rpm = state.rpm;
      const nextGear = state.gear + 1;
      const prevGear = state.gear - 1;

      // const upSpeed = config.shiftUpSpeeds[state.gear] || Infinity;
      const downSpeed = config.shiftDownSpeeds[state.gear] || 0;

      const shouldUpshift = nextGear < config.gearRatios.length && (rpm > shiftUpRpm);
      // (rpm > config.shiftUpRpm || speed > upSpeed);

      const shouldDownshift =
        prevGear > 0 &&
        (rpm < shiftDownRpm || speed < downSpeed);

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










    // Fuel consumption logic
    if (state.engineOn && fuel.fuel > 0) {
      const gearMultiplier = state.gear;
      const throttle = control.forward || control.backward ? 1 : 0.2; // higher burn under load
      const rpmFactor = state.rpm / config.maxRpm;
      let burn = config.baseConsumption

      // burn less fuel in neutral 
      gearMultiplier === 0
        ? burn = burn * rpmFactor * throttle
        : burn = burn * rpmFactor * throttle * gearMultiplier;


      fuel.fuel = Math.max(0, fuel.fuel - burn);

      if (fuel.fuel === 0) {
        // state.engineOn = false;
        state.engineShuttingDown = true;
        console.log(`Fuel empty — engine shutting off for ${id}`);
      }
    }

    if ((fuel.fuel === 0) && (state.rpms === 0)) {
      state.engineOn = false;
    }

    if (control.refuel) {
      fuel.fuel = Math.min(1.0, fuel + 0.01); // simulate refueling
    }










    const tempCfg = config.engineTemp;

    if (state.engineOn) {
      if (control.forward || control.backward) {
        state.engineTemp += tempCfg.heatRate;

        // Simulate harder heating at high RPM
        const rpmFactor = state.rpm / config.maxRpm;
        state.engineTemp += tempCfg.heatRate * rpmFactor * 0.2;
      } else {
        state.engineTemp -= tempCfg.coolRate;
      }
    } else {
      // passive cooling when off
      state.engineTemp -= tempCfg.coolRate * 2;
    }

    // Clamp temperature
    state.engineTemp = Math.max(tempCfg.min, Math.min(tempCfg.critical, state.engineTemp));


    // Engine overheating behavior
    if (state.engineTemp >= tempCfg.critical) {
      if (!state.engineShuttingDown) {
        // console.log(`ENGINE CRITICAL: shutting down for ${id}`);
        state.engineShuttingDown = true;
      }

      // Begin decaying RPM only if it's still running
      if (state.rpm > idleRpm) {
        state.rpm -= tempCfg.coolRate * 5; // crank down faster than idle decay
      } else {
        // state.rpm = idleRpm;
        state.engineOn = false;
        state.engineShuttingDown = false;
      }
    } else if (state.engineTemp >= tempCfg.overheat) {
      // Optional: Reduce power/force if overheated
      // console.log(`ENGINE OVERHEATING for ${id}`);
      // e.g., reduce engineForce in updateVehicleControls()
    }







    // send physics snapshot to frontend
    snapshots[id] = {
      chassisBody: {
        position: chassis.position,
        quaternion: chassis.quaternion,
        velocity: { ...chassisBody.velocity },
        angularVelocity: { ...chassisBody.angularVelocity }
      },
      data: {
        speed: chassisBody.velocity.length() * 2.23694, //convert to mph
        steeringValue: vehicle.steeringValue,
        engineRpm: Math.round(state.rpm),
        engineStarting: state.engineStarting,
        gear: state.gear,
        fuel: fuel.fuel,
        temp: Math.round(state.engineTemp),
      },
      wheelInfos
    };

  } // end for loop

  return snapshots;
}
module.exports = { createVehicle, updateVehicleControls, stepWorld };