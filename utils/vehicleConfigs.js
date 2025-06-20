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
    maxSpeed: 60, // m/s ~216 km/h
    maxForce: 500,
    maxBrakeForce: 25,
    brakeLerpSpeed: 0.25, // Smoothing factor
    angularVelocity: [0, 0.5, 0],
    maxBoost: 100,
    cameras: ['DEFAULT', 'FIRST_PERSON', 'BIRD_EYE'],
    dpr: 1.5,
    levelLayer: 1,
    engineValue: 0, // engine off

    gearRatios: [0, 4.2, 3.2, 2.4, 1.8, 1.3, 1.0],// gears 1–6
    // shiftUpSpeeds:   [0, 7, 15, 25, 35, 45],// m/s
    shiftDownSpeeds: [0, 3, 8, 13, 18, 25],
    finalDrive: 3.9,
    idleRpm: 850,
    maxRpm: 7200,
    shiftUpRpm: 6500,
    shiftDownRpm: 2500,

    engineTemp: {
        min: 160,           // °F when idle
        max: 250,           // °F max safe temp
        overheat: 240,      // °F begins overheating behavior
        critical: 260,      // °F critical, engine shuts off
        heatRate: 0.05,     // per tick when under throttle
        coolRate: 0.03,     // per tick when idle
    },
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