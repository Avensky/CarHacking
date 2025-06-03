const { World, Body, Box, Vec3, RaycastVehicle, Material, Cylinder, ContactMaterial, Plane } = require('cannon-es');

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
groundBody.position.set(0, 0, 0);
// Add the body to the world
world.addBody(groundBody);

// Define interactions between wheels and ground
const wheelMaterial = new Material('wheel')
const wheel_ground = new ContactMaterial(wheelMaterial, groundMaterial, {
  friction: 0.6,
  restitution: 0,
  contactEquationStiffness: 1e6,
  contactEquationRelaxation: 3,
})
world.addContactMaterial(wheel_ground)


// vehicle
const vehicles = {};
const steeringState = {}; // key: id, value: current steer angle
const brakeState = {}; // key: id, value: current brake force

const length = 4.21  // <- Match AE86 GLB length
const width = 1.92
const height = 1.28

const chassisMass = 250
const suspensionRestLength = 0.18
const radius = 0.623

function createVehicle(id) {
  steeringState[id] = 0; // Initialize steering angle
  brakeState[id] = 0;

  const wheelOptions = {
    radius: radius,
    directionLocal: new Vec3(0, -1, 0), // Down
    // suspensionStiffness: 1,
    suspensionStiffness: 150,
    suspensionRestLength: suspensionRestLength,
    frictionSlip: 8.5,
    dampingRelaxation: 6.5,       // resistance during compression
    dampingCompression: 6.5,       // resistance on rebound
    // maxSuspensionForce: 0,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new Vec3(-1, 0, 0), // Left
    chassisConnectionPointLocal: new Vec3(), // set below
    isFrontWheel: true
  }
  const chassisShape = new Box(new Vec3(width / 2, height / 2, length / 2));
  const chassisBody = new Body({
    mass: chassisMass,
  });
  chassisBody.addShape(chassisShape);
  const compressionFactor = .7;
  const rideHeight = radius + suspensionRestLength * compressionFactor; // Midway compression
  chassisBody.position.set(0, rideHeight, 0); // Lift above ground

  const vehicle = new RaycastVehicle({
    chassisBody,
    indexRightAxis: 0, // X
    indexUpAxis: 1,    // Y
    indexForwardAxis: 2 // Z
  });



  // Set positions:
  // const wheelHalfTrack = width / 3 - 0.1; // Distance from center to side
  // const wheelBase = 1.6;      // Distance front to back

  const wheelHalfTrack = width / 2 - 0.25
  const wheelBase = 2.41 // Distance front to back

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
  const maxSteer = 0.5;
  const maxForce = 700;
  const maxBrakeForce = 25;
  const { vehicle } = vehicles[id] || {};
  const brakeLerpSpeed = 0.25; // Smoothing factor
  brakeState[id] = brakeState[id] || 0;

  if (!vehicle) return;



  // Reset
  // driveWheels.forEach(i => vehicle.applyEngineForce(0, i));
  // steeringWheels.forEach(i => vehicle.setSteeringValue(0, i));
  // [0, 1, 2, 3].forEach(i => vehicle.setBrake(0, i));

  vehicle.setSteeringValue(0, 0); //clear steering
  vehicle.setSteeringValue(0, 1); //clear steering
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


// function resetVehicle(id) {
//   const { chassisBody } = vehicles[id]
//   chassisBody.position.set(0, 5, 0) // reset position
//   const q = new Quaternion()
//   q.setFromEuler(0, Math.PI / 2, 0)
//   chassisBody.quaternion.copy(q)
//   chassisBody.velocity.setZero()
//   chassisBody.angularVelocity.setZero()
// }

function stepWorld() {
  world.step(1 / 60);
  const snapshots = {};

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

    snapshots[id] = {
      chassisBody: {
        position: chassis.position,
        quaternion: chassis.quaternion,
        velocity: { ...chassisBody.velocity },
        angularVelocity: { ...chassisBody.angularVelocity }
      },
      wheelInfos
    };
  }

  return snapshots;
}

module.exports = { createVehicle, updateVehicleInputs, stepWorld };