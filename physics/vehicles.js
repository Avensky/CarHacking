// physics/vehicles.js

const { Box, Body, Vec3, RaycastVehicle, Cylinder } = require('cannon-es');
const getVehicleConfig = require('../utils/vehicleConfigs');
const { world, wheelMaterial } = require('./world');
const { vehicles, gearboxState, fuelState, steeringState, brakeState } = require('./state');

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
        clutchSlip: 0,
        justDownshifted: false,
        engineTemp: config.engineTemp.min,
        overheating: false,
        cooldownStartTime: null,
        lastUpdate: performance.now(),
    };
    steeringState[id] = 0;
    brakeState[id] = 0;
    fuelState[id] = { fuel: config.fuelCapacity };

    console.log(`Created ${id}: gear=${gearboxState[id].gear}, rpm=${gearboxState[id].rpm}`);

    const wheelOptions = {
        radius: config.radius,
        directionLocal: config.directionLocal,
        suspensionStiffness: config.suspensionStiffness,
        suspensionRestLength: config.suspensionRestLength,
        frictionSlip: config.frictionSlip,
        dampingRelaxation: config.dampingRelaxation,
        dampingCompression: config.dampingCompression,
        maxSuspensionForce: config.maxSuspensionForce,
        maxSuspensionTravel: config.maxSuspensionTravel,
        rollInfluence: config.rollInfluence,
        axleLocal: config.axleLocal,
        // chassisConnectionPointLocal: config.chassisConnectionPointLocal,
        // isFrontWheel: config.isFrontWheel
    };

    const chassisShape = new Box(new Vec3(config.width / 2, config.height / 2, config.length / 2));
    const suspensionTravel = config.suspensionRestLength * config.compressionFactor;
    const rideHeight = config.radius + suspensionTravel + config.height / 2;

    const chassisBody = new Body({
        mass: config.chassisMass,
        position: new Vec3(0, rideHeight, 0),
        rotation: config.rotation,
        collisionFilterGroup: 1,
        collisionFilterMask: 0,
    });

    const shapeOffset = new Vec3(0, -config.height / 2 + config.chassisOffsetY, 0);
    chassisBody.addShape(chassisShape, shapeOffset);

    const vehicle = new RaycastVehicle({
        chassisBody,
        indexRightAxis: config.indexRightAxis,
        indexUpAxis: config.indexUpAxis,
        indexForwardAxis: config.indexForwardAxis
    });

    const wheelHalfTrack = config.width / 2 - config.wheelHalfTrackOffset;
    const wheelBase = config.wheelBase;
    const chassisY = config.chassisOffsetY - config.height / 2;

    const wheels = [
        { x: -wheelHalfTrack, z: -wheelBase / 2, isFrontWheel: true },
        { x: +wheelHalfTrack, z: -wheelBase / 2, isFrontWheel: true },
        { x: -wheelHalfTrack, z: +wheelBase / 2, isFrontWheel: false },
        { x: +wheelHalfTrack, z: +wheelBase / 2, isFrontWheel: false },
    ];

    wheels.forEach(({ x, z, isFrontWheel }) => {
        vehicle.addWheel({
            ...wheelOptions,
            chassisConnectionPointLocal: new Vec3(x, chassisY, z),
            isFrontWheel,
        });
    });

    vehicle.addToWorld(world);

    vehicles[id] = { vehicle, chassisBody };

    vehicle.wheelInfos.forEach(wheel => {
        const cylinderShape = new Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
        const wheelBody = new Body({ mass: 0, material: wheelMaterial });
        wheelBody.type = Body.KINEMATIC;
        wheelBody.collisionFilterGroup = 0;
        wheelBody.addShape(cylinderShape);
        world.addBody(wheelBody);
    });

    return vehicle;
}

function resetVehicle(vehicle, controlMap) {
    vehicle.chassisBody.velocity.setZero();
    vehicle.chassisBody.angularVelocity.setZero();
    vehicle.chassisBody.position.set(0, .25, 0);
    vehicle.chassisBody.quaternion.set(0, 0, 0, 1);
    vehicle.chassisBody.force.setZero();
    vehicle.chassisBody.torque.setZero();
    vehicle.chassisBody.wakeUp();

    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
        const wheel = vehicle.wheelInfos[i];
        wheel.suspensionLength = wheel.suspensionRestLength;
        vehicle.updateWheelTransform(i);
    }
    vehicle.updateSuspension();

    const id = Object.keys(vehicles).find((key) => vehicles[key].vehicle === vehicle);
    if (id) {
        const config = getVehicleConfig(vehicle.type);
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
            lastUpdate: performance.now(),
            powerMultiplier: 1,
        };

        if (controlMap[id]) {
            controlMap[id].engineOn = false;
            controlMap[id].reset = false;
        }

        console.log(`Vehicle ${id} fully reset: controls + gearbox`);
    }
}

module.exports = { createVehicle, resetVehicle };
