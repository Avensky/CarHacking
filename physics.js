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
const vehicles = {};// store all vehicles


// Wheel Config
function createVehicle(id, type) {
  const config = getVehicleConfig(type);

  gearboxState[id] = {
    gear: 0,
    rpm: 0,
    clutchEngaged: false,
    engineOn: false,
    _prevGear: 0,
    clutchSlip: 0, // assume fully disengaged until it starts moving, 0 = fully disengaged, 1 = fully locked
  };
  steeringState[id] = 0; // Initialize steering angle
  brakeState[id] = 0;

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
  const rideHeight = config.radius + config.suspensionRestLength * config.compressionFactor // Midway compression
  const chassisBody = new Body({
    mass: config.chassisMass,
    position: new Vec3(0, rideHeight, 0),// spawn
    rotation: config.rotation,
    collisionFilterGroup: 1,
    collisionFilterMask: 0,
    shape: chassisShape
  });

  const vehicle = new RaycastVehicle({
    chassisBody,
    indexRightAxis: config.indexRightAxis, // X
    indexUpAxis: config.indexUpAxis,    // Y
    indexForwardAxis: config.indexForwardAxis // Z
  });

  const wheelHalfTrack = config.width / 2 - config.wheelHalfTrackOffset
  const wheelBase = config.wheelBase
  const frontLeft = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(-wheelHalfTrack, 0, -wheelBase / 2), isFrontWheel: true
  };
  const frontRight = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(+wheelHalfTrack, 0, -wheelBase / 2), isFrontWheel: true
  };
  const rearLeft = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(-wheelHalfTrack, 0, +wheelBase / 2), isFrontWheel: false
  };
  const rearRight = {
    ...wheelOptions,
    chassisConnectionPointLocal: new Vec3(+wheelHalfTrack, 0, +wheelBase / 2), isFrontWheel: false
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

function updateVehicleControls(id, control) {
  const { vehicle } = vehicles[id] || {};
  if (!vehicle) return;
  // console.log(`Created ${id}: gear=${gearboxState[id].gear}, rpm=${gearboxState[id].rpm}, clutch=${gearboxState[id].clutchSlip}`);
  const config = getVehicleConfig(vehicle.type);

  if (control.reset) {
    resetVehicle(vehicle); // reset position to start
  }

  // Reset steering
  vehicle.setSteeringValue(0, 0);
  vehicle.setSteeringValue(0, 1);

  // Reset breaks
  if (control.forward || control.backward) {
    for (let i = 0; i < 4; i++) vehicle.setBrake(0, i);
    brakeState[id] = 0; // reset cached brake state
  }

  const {
    gearRatios, // gears 1–6
    finalDrive,
    idleRpm,
    maxRpm,
    shiftUpRpm,
    shiftDownRpm,
  } = config

  const gearRatio = gearRatios[gearboxState[id].gear] ?? 1;
  // Controls
  const forwardForce = config.maxForce * (gearRatio / gearRatios[1]); // normalized to 1st gear

  // Enforce rev limiter
  // if (gearboxState[id].rpm >= maxRpm) {
  //   // simulate cut-off (optional)
  //   vehicle.applyEngineForce(0, 2);
  //   vehicle.applyEngineForce(0, 3);
  // }
  if (control.forward) {

    vehicle.applyEngineForce(+forwardForce, 2);
    vehicle.applyEngineForce(+forwardForce, 3);
  } else if (control.backward) {
    vehicle.applyEngineForce(-forwardForce, 2);
    vehicle.applyEngineForce(-forwardForce, 3);
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
  }
  // for handbrake
  if (control.handbrake) {
    rearWheels.forEach(i => vehicle.setBrake(1.5 * config.maxBrakeForce, i));
  }
}




// console.log(world.bodies.length)
// world.bodies.forEach(body => console.log(body.id, body.shapes, body.position))

function resetVehicle(vehicle) {
  // vehicle.chassisBody.rotation.set(0, 5, 0)
  vehicle.chassisBody.position.set(0, 7, 0) //reset position
  const q = new Quaternion()
  q.setFromEuler(0, Math.PI / 2, 0)
  vehicle.chassisBody.quaternion.copy(q)
  vehicle.chassisBody.velocity.set(0, 0, 0)
  vehicle.chassisBody.angularVelocity.set(0, 0, 0)
}








function stepWorld(controlMap = {}) {
  world.step(1 / 60);

  // Update all vehicles
  for (const [id, { vehicle, chassisBody }] of Object.entries(vehicles)) {
    const control = controlMap[id] || {};
    const config = getVehicleConfig(vehicle.type);
    const state = gearboxState[id];

    // Clamp gear between 0 and max
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

    // ENGINE CONTROL
    if (control.engineOn && !state.engineOn) {
      console.log(`Engine turned on for ${id}`);
      state.engineOn = true;
    } else if (!control.engineOn && state.engineOn) {
      console.log(`Engine turned off for ${id}`);
      state.engineOn = false;
    }

    // get physics data
    const chassis = {
      position: { ...chassisBody.position },
      quaternion: { ...chassisBody.quaternion },
    };

    const wheelInfos = vehicle.wheelInfos.map(w => ({
      position: { ...w.worldTransform.position },
      quaternion: { ...w.worldTransform.quaternion },
    }));

    // simulate idle rmps
    if (!state.engineOn) {
      state.rpm = 0;
    } else if (state.gear === 0) {
      const fluctuation = Math.sin(Date.now() * 0.01 + id.length) * 50; // wiggle ±50 rpm
      state.rpm = config.idleRpm + fluctuation;
    }

    snapshots[id] = {
      chassisBody: {
        position: chassis.position,
        quaternion: chassis.quaternion,
        velocity: { ...chassisBody.velocity },
        angularVelocity: { ...chassisBody.angularVelocity }
      },
      data: {
        speed: chassisBody.velocity.length(),
        steeringValue: vehicle.steeringValue,
        engineRpm: Math.round(state.rpm),
        gear: state.gear,
      },
      wheelInfos
    };

    if (state.gear === 0 || !state.engineOn) continue;


    // VEHICLE STATE
    // const state = gearboxState[id];
    // state.gear = Math.min(Math.max(state.gear, 1), gearRatios.length - 1);

    // // if (state.gear >= gearRatios.length) state.gear = 1; // clamp
    // // if (state.gear < 1) state.gear = 1;
    // const vehicleSpeed = chassisBody.velocity.length();

    // // Rear wheel angular velocity → RPM
    // let avgOmega = 0;
    // for (const i of [2, 3]) {
    //   avgOmega += vehicle.wheelInfos[i].deltaRotation / (1 / 60);
    // }
    // avgOmega /= 2;

    // const wheelRpm = (avgOmega * 60) / (2 * Math.PI);
    // const drivenRpm = wheelRpm * gearRatio * finalDrive;

    // // Blend clutch slip
    // const clutchTarget = state.clutchEngaged ? 1.0 : 0.0;
    // state.clutchSlip += (clutchTarget - state.clutchSlip) * slipLerpSpeed;

    // // Simulated throttle RPM (when clutch disengaged)
    // const throttleInput = Math.max(vehicle.engineValue || 0, idleThrottle);
    // const throttleRpm = idleRpm + (maxRpm - idleRpm) * throttleInput;

    // // Final engine RPM
    // let engineRpm = drivenRpm * state.clutchSlip + throttleRpm * (1 - state.clutchSlip);
    // engineRpm = Math.min(maxRpm, Math.max(idleRpm, engineRpm));

    // const previousGear = state._prevGear ?? state.gear; // fallback for first frame
    // const isShifting = state.gear !== previousGear;
    // state.clutchEngaged = !(isShifting || vehicleSpeed < 1);

    // // Auto shift logic
    // if (vehicle.engineValue > 0 && engineRpm > shiftUpRpm && state.gear < gearRatios.length - 1) {
    //   state.gear++;
    // } else if (vehicle.engineValue > 0 && engineRpm < shiftDownRpm && state.gear > 1) {
    //   state.gear--;
    // }

    // state._prevGear = state.gear;

    // // Update state
    // // state.rpm = Math.max(idleRpm, engineRpm);
    // if (state._prevGear !== state.gear) {
    //   console.log(`Gear change for ${id}: ${state._prevGear} → ${state.gear}`);
    // }
    // state.rpm = engineRpm;
    // gearboxState[id] = state;
    // console.log('rpm', Math.round(state.rpm))
    // console.log('gear', state.gear)

  }

  return snapshots;
}
module.exports = { createVehicle, updateVehicleControls, stepWorld };