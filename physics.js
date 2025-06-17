const { World, Body, Box, Vec3, RaycastVehicle, Material, Cylinder, ContactMaterial, Plane, Quaternion } = require('cannon-es');
const getVehicleConfig = require('./utils/vehicleConfigs')
const snapshots = {};
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

// store all vehicles
const vehicles = {};

// state
const steeringState = {}; // key: id, value: current steer angle
const brakeState = {}; // key: id, value: current brake force


// Wheel Config


function createVehicle(id, type) {
  const config = getVehicleConfig(type);
  steeringState[id] = 0; // Initialize steering angle
  brakeState[id] = 0;

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



function updateVehicleInputs(id, control) {
  const { vehicle } = vehicles[id] || {};
  if (!vehicle) return;
  const config = getVehicleConfig(vehicle.type);

  brakeState[id] = brakeState[id] || 0;

  // Reset
  // console.log(
  //   'updateVechicleInputs', control.reset
  // )
  if (control.reset) {
    resetVehicle(vehicle); // ← implement this
  }

  vehicle.setSteeringValue(0, 0);
  vehicle.setSteeringValue(0, 1);

  // driveWheels.forEach(i => vehicle.applyEngineForce(0, i));
  // steeringWheels.forEach(i => vehicle.setSteeringValue(0, i));
  // [0, 1, 2, 3].forEach(i => vehicle.setBrake(0, i));

  if (control.forward || control.backward) {
    for (let i = 0; i < 4; i++) vehicle.setBrake(0, i);
    brakeState[id] = 0; // reset cached brake state
  }
  // Controls
  if (control.forward) {
    vehicle.applyEngineForce(+config.maxForce, 2)
    vehicle.applyEngineForce(+config.maxForce, 3)
  } else if (control.backward) {
    vehicle.applyEngineForce(-config.maxForce, 2)
    vehicle.applyEngineForce(-config.maxForce, 3)
  } else {
    vehicle.applyEngineForce(0, 2)
    vehicle.applyEngineForce(0, 3)
  }

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
  vehicle.engineValue = 1
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

function stepWorld() {
  world.step(1 / 60);

  for (const [id, { vehicle, chassisBody }] of Object.entries(vehicles)) {
    // console.log("rotation", vehicle.wheelInfos[0].deltaRotation)
    const chassis = {
      position: { ...chassisBody.position },
      quaternion: { ...chassisBody.quaternion },
    };

    const wheelInfos = vehicle.wheelInfos.map(w => ({
      position: { ...w.worldTransform.position },
      quaternion: { ...w.worldTransform.quaternion },
    }));
    // vehicle.wheelInfos.forEach((w, i) => {
    //   console.log(`wheel[${i}].isInContact =`, w.isInContact);
    // });
    // const velocity = vehicle.chassisBody.velocity;
    // speed = velocity.length(); // in meters per second (m/s)

    snapshots[id] = {
      chassisBody: {
        position: chassis.position,
        quaternion: chassis.quaternion,
        velocity: { ...chassisBody.velocity },
        angularVelocity: { ...chassisBody.angularVelocity }
      },
      data: {
        speed: vehicle.chassisBody.velocity.length(),
        steeringValue: vehicle.steeringValue,
        engineValue: vehicle.engineValue,
      },
      wheelInfos
    };
  }

  return snapshots;
}
module.exports = { createVehicle, updateVehicleInputs, stepWorld };