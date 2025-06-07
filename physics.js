const { World, Body, Box, Vec3, RaycastVehicle, Material, Cylinder, ContactMaterial, Plane, Quaternion } = require('cannon-es');

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
const axleLocal = new Vec3(-1, 0, 0)
const compressionFactor = .7;
const dampingRelaxation = 6.5       // resistance during compr=ssion
const dampingCompression = 6.5       // resistance on r=bound
const directionLocal = new Vec3(0, -1, 0)
const frictionSlip = 8.5
const suspensionStiffness = 150
const suspensionRestLength = 0.18
const maxSuspensionForce = 100000
const maxSuspensionTravel = 0.3
const radius = 0.623
const rollInfluence = 0.01
const chassisConnectionPointLocal = new Vec3()
const isFrontWheel = true

// vehicleConfig
const length = 4.21   // <- Match AE86 GLB
const width = 1.92    // <- Match AE86 GLB
const height = 1.28   // <- Match AE86 GLB
const chassisMass = 250
const chassisShape = new Box(new Vec3(width / 2, height / 2, length / 2));
const indexRightAxis = 0 // X
const indexUpAxis = 1   // Y
const indexForwardAxis = 1 // Z
const rideHeight = radius + suspensionRestLength * compressionFactor; // Midway compression
const position = new Vec3(10, rideHeight, 0) // spawn
const rotation = new Vec3(0, Math.PI, 0)
const wheelHalfTrack = width / 2 - 0.25 // Distance from center to side
const wheelBase = 2.41 // Distance front to back

// Options
const steer = 0.3
const maxSteer = 0.5
const force = 1800
const maxBrake = 65
const maxSpeed = 88
const maxForce = 500;
const maxBrakeForce = 25;
const brakeLerpSpeed = 0.25; // Smoothing factor
const angularVelocity = [0, 0.5, 0]
const maxBoost = 100
const cameras = ['DEFAULT', 'FIRST_PERSON', 'BIRD_EYE']
const dpr = 1.5
const levelLayer = 1

function createVehicle(id) {
  steeringState[id] = 0; // Initialize steering angle
  brakeState[id] = 0;

  const wheelOptions = {
    radius: radius,
    directionLocal: directionLocal, // Down
    suspensionStiffness: suspensionStiffness,
    suspensionRestLength: suspensionRestLength,
    frictionSlip: frictionSlip,
    dampingRelaxation: dampingRelaxation,       // resistance during compression
    dampingCompression: dampingCompression,       // resistance on rebound
    maxSuspensionForce: maxSuspensionForce,
    maxSuspensionTravel: maxSuspensionTravel,
    rollInfluence: rollInfluence,
    axleLocal: axleLocal, // Left
    chassisConnectionPointLocal: chassisConnectionPointLocal, // set below
    isFrontWheel: isFrontWheel
  }

  const chassisBody = new Body({
    mass: chassisMass,
    position: position,
    rotation: rotation,
    collisionFilterGroup: 1,
    collisionFilterMask: 0,
    shape: chassisShape
  });

  const vehicle = new RaycastVehicle({
    chassisBody,
    indexRightAxis: indexRightAxis, // X
    indexUpAxis: indexUpAxis,    // Y
    indexForwardAxis: indexForwardAxis // Z
  });
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
    vehicle.applyEngineForce(+maxForce, 2)
    vehicle.applyEngineForce(+maxForce, 3)
  } else if (control.backward) {
    vehicle.applyEngineForce(-maxForce, 2)
    vehicle.applyEngineForce(-maxForce, 3)
  } else {
    vehicle.applyEngineForce(0, 2)
    vehicle.applyEngineForce(0, 3)
  }

  let targetSteer = 0;
  if (control.left) {
    targetSteer = +maxSteer;
  } else if (control.right) {
    targetSteer = -maxSteer;
  }

  // Lerp toward target steer
  const currentSteer = steeringState[id] ?? 0;
  const lerpSpeed = 0.15; // Lower = smoother/slower
  const newSteer = currentSteer + (targetSteer - currentSteer) * lerpSpeed;

  steeringState[id] = newSteer;

  vehicle.setSteeringValue(newSteer, 0)
  vehicle.setSteeringValue(newSteer, 1)

  const braking = control.brake && !control.forward;
  const targetBrake = braking ? maxBrakeForce : 0;

  // Smooth brake force application
  const currentBrake = brakeState[id] ?? 0;
  const newBrake = currentBrake + (targetBrake - currentBrake) * brakeLerpSpeed;
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

  // for handbreak
  if (control.handbrake) {
    rearWheels.forEach(i => vehicle.setBrake(1.5 * maxBrakeForce, i));
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
  const snapshots = {};

  for (const [id, { vehicle, chassisBody }] of Object.entries(vehicles)) {
    // console.log("rotation", vehicle.wheelInfos[0].deltaRotation)
    const chassis = {
      rotation: { ...chassisBody.rotation },
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

    snapshots[id] = {
      chassisBody: {
        position: chassis.position,
        quaternion: chassis.quaternion,
        rotation: chassis.rotation,
        velocity: { ...chassisBody.velocity },
        angularVelocity: { ...chassisBody.angularVelocity }
      },
      wheelInfos
    };
  }

  return snapshots;
}
module.exports = { createVehicle, updateVehicleInputs, stepWorld };