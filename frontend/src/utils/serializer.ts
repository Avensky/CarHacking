import { Vec3 } from 'cannon-es'

export function serializeVec3(v: { x: any; y: any; z: any }) {
    return { x: v.x, y: v.y, z: v.z }
}

export function deserializeVec3(obj: { x: number | undefined; y: number | undefined; z: number | undefined }) {
    return new Vec3(obj.x, obj.y, obj.z)
}
export function serializeVehicleConfig(config: { position: any; rotation: any }) {
    return {
        ...config,
        position: serializeVec3(config.position),
        rotation: serializeVec3(config.rotation),
    }
}

export function deserializeVehicleConfig(data: { position: any; rotation: any }) {
    return {
        ...data,
        position: deserializeVec3(data.position),
        rotation: deserializeVec3(data.rotation),
    }
}