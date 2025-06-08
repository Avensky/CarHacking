
const { Vec3 } = require('cannon-es');

// Helpers
function serializeVec3(v) {
    return { x: v.x, y: v.y, z: v.z };
}

function deserializeVec3(obj) {
    return new Vec3(obj.x, obj.y, obj.z);
}

function serializeVehicleConfig(config) {
    return {
        ...config,
        position: serializeVec3(config.position),
        rotation: serializeVec3(config.rotation),
    };
}

function deserializeVehicleConfig(data) {
    return {
        ...data,
        position: deserializeVec3(data.position),
        rotation: deserializeVec3(data.rotation),
    };
}

function serializeQuat(q) {
    return [q.x, q.y, q.z, q.w];
}

module.exports = {
    // createVehicleConfig,
    serializeVec3,
    deserializeVec3,
    serializeVehicleConfig,
    deserializeVehicleConfig,
    serializeQuat
};