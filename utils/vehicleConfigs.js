const { Vec3 } = require('cannon-es');
const carConfig = {
    wheelCount: 4,
    radius: 0.623,
    isTank: false,
    axleLocal: new Vec3(-1, 0, 0),
    compressionFactor: .7,
    dampingRelaxation: 6.5,       // resistance during compr:ssion
    dampingCompression: 6.5,       // resistance on r:bound
    directionLocal: new Vec3(0, -1, 0),

    frictionSlip: 8.5,
    suspensionStiffness: 150,
    suspensionRestLength: 0.18,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    rollInfluence: 0.01,
    chassisConnectionPointLocal: new Vec3(),
    isFrontWheel: true,

    // vehicleConfig
    length: 4.21,   // <- Match AE86 GLB
    width: 1.92,    // <- Match AE86 GLB
    height: 1.28,   // <- Match AE86 GLB
    chassisMass: 250,
    indexRightAxis: 0, // X
    indexUpAxis: 1,   // Y
    indexForwardAxis: 1, // Z
    wheelHalfTrackOffset: 0.25, // Distance from center to side
    wheelBase: 2.41, // Distance front to back
    fuelCapacity: 45,          // Liters
    baseConsumption: 0.004,   // Liters per tick per gear (baseline)

    // Options
    steer: 0.3,
    maxSteer: 0.5,
    maxBrake: 65,
    maxSpeed: 120,
    maxForce: 500,
    maxBrakeForce: 25,
    brakeLerpSpeed: 0.25, // Smoothing factor
    angularVelocity: [0, 0.5, 0],
    maxBoost: 100,
    cameras: ['DEFAULT', 'FIRST_PERSON', 'BIRD_EYE'],
    dpr: 1.5,
    levelLayer: 1,
    engineValue: 0, // engine off

    gearRatios: [0, 3.6, 2.19, 1.41, 1.0, 0.83, .074], // gears 1–6
    shiftUpSpeeds: [0, 15, 30, 50, 70, 90],// m/s
    shiftDownSpeeds: [0, 10, 25, 45, 65, 85],
    finalDrive: 3.9,
    idleRpm: 850,
    maxRpm: 7000,
    shiftUpRpm: 6500,
    shiftDownRpm: 2500,
}
const tankConfig = {
    wheelCount: 2, // or 6+ if tracked
    wheelBase: 3.5,
    radius: 0.8,
    maxForce: 3000,
    isTank: true,
    // track logic, idle turning, etc.
}
const configs = {
    car: carConfig,
    tank: tankConfig,
};
module.exports = function getVehicleConfig(type = 'car') {
    return configs[type] || carConfig;
};