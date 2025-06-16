// utils/createGlassMaterialFactory.ts
import * as THREE from 'three'

export interface GlassMaterialOptions {
    opacity?: number
    ior?: number
    thickness?: number
    roughness?: number
    envMapIntensity?: number
    color?: THREE.Color | string
}

export function createGlassMaterialFactory(options: GlassMaterialOptions = {}) {
    const {
        opacity = 0.4,
        ior = 1.5,
        thickness = 0.01,
        roughness = 0.1,
        envMapIntensity = 1.2,
        color = '#ffffff',
    } = options

    return () => new THREE.MeshPhysicalMaterial({
        color: typeof color === 'string' ? new THREE.Color(color) : color,
        transparent: true,
        opacity,
        depthWrite: false,
        roughness,
        metalness: 0,
        reflectivity: 1,
        transmission: 1,
        ior,
        thickness,
        side: THREE.DoubleSide,
        envMapIntensity,
    })
}
