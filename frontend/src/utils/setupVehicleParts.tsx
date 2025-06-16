// setupVehicleParts.tsx
import * as THREE from 'three'
import { createGlassMaterialFactory } from './createGlassMaterialFactory';

import React from 'react'

export interface VehiclePartGroup {
    name: string
    parts: string[]
    transparent?: string[]
    opacity?: number
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
}

export function setupVehicleParts({
    scene,
    groups,
}: {
    scene: THREE.Group | THREE.Scene
    groups: VehiclePartGroup[]
}): {
    clonesByGroup: Record<string, Record<string, THREE.Object3D>>
    renderedGroups: Record<string, JSX.Element>
} {
    const clonesByGroup: Record<string, Record<string, THREE.Object3D>> = {}
    const renderedGroups: Record<string, JSX.Element> = {}

    const glassFactory = createGlassMaterialFactory({ opacity: 0.05, ior: 1.5 });

    for (const group of groups) {
        const {
            name,
            parts,
            transparent = [],
            opacity,
            position,
            rotation,
            scale,
        } = group

        // console.log('opacity', opacity);
        const clonedMap: Record<string, THREE.Object3D> = {}
        const groupRef = React.createRef<THREE.Group>()
        const children: JSX.Element[] = []

        const seen = new Set<string>();

        for (const partName of parts) {
            if (seen.has(partName)) continue;
            seen.add(partName);

            const original = scene.getObjectByName(partName);
            if (!original) {
                console.warn(`Part "${partName}" not found in scene`);
                continue;
            }

            const isPartTransparent = transparent.includes(partName); // ✅ FIX: Lock transparency per part
            const cloned = original.clone(true);

            cloned.traverse((node) => {
                if ((node as any).isMesh) {
                    const mesh = node as THREE.Mesh;
                    const mat = mesh.material;

                    const applyMaterial = (sourceMat: any) => {
                        if (isPartTransparent) {
                            return glassFactory();
                        }
                        const clonedMat = sourceMat.clone?.() ?? sourceMat;
                        clonedMat.transparent = false;
                        clonedMat.opacity = 1;
                        clonedMat.depthWrite = true;
                        return clonedMat;
                    };

                    mesh.material = Array.isArray(mat)
                        ? mat.map(applyMaterial)
                        : applyMaterial(mat);

                    mesh.castShadow = true;
                    mesh.receiveShadow = !isPartTransparent;
                }
            });

            children.push(<primitive key={partName} object={cloned} />);
            clonedMap[partName] = cloned;
        }

        clonesByGroup[name] = clonedMap
        renderedGroups[name] = (
            <group
                key={name}
                ref={groupRef}
                name={name}
                position={position}
                rotation={rotation}
                scale={scale}
            >
                {children}
            </group>
        )
    }

    return { clonesByGroup, renderedGroups }
}
