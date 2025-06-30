const { Vec3 } = require('cannon-es');
const carConfig = {
    wheelCount: 4,
    radius: 0.3115, // distance from wheel center to bottom of the tire
    axleLocal: new Vec3(-1, 0, 0),
    chassisOffsetY: .83, // tweak this upward or downward depending on visual test
    compressionFactor: .01, // suspension extension under the car’s own weight
    suspensionStiffness: 100, // medium firmness
    suspensionRestLength: 0.12, // max extension of the suspension
    maxSuspensionTravel: 0.13,
    dampingRelaxation: 4.8,       // resistance during compr:ssion
    dampingCompression: 4.4,       // resistance on rebound
    directionLocal: new Vec3(0, -1, 0),
    wheelHalfTrackOffset: 0.25, // Distance from center to side
    wheelBase: 2.39, // Distance front to back

    frictionSlip: 8.5,
    maxSuspensionForce: 10000, // realistic cap
    rollInfluence: 0.05, // mild roll
    chassisConnectionPointLocal: new Vec3(),
    isFrontWheel: true, //placeholder

    // vehicleConfig
    length: 4.21,   // <- Match AE86 GLB
    width: 1.92,    // <- Match AE86 GLB
    height: 1.14,   // <- Match AE86 GLB
    chassisMass: 250,
    indexRightAxis: 0, // X
    indexUpAxis: 1,   // Y
    indexForwardAxis: 1, // Z
    fuelCapacity: 45,          // Liters
    baseConsumption: 0.004,   // fuel (Liters) per tick per gear

    // Options
    steer: 0.3,
    maxSteer: 0.5,
    maxBrake: 65,
    maxSpeed: 60, // m/s ~134 m/h
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
    shiftDownSpeeds: [0, .4, 8, 13, 18, 25, 30], // ~[0,1,15,30,45,60]mph
    finalDrive: 3.9,
    idleRpm: 750,
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