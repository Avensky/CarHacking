// setupVehicleParts.tsx
import * as THREE from 'three'
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
        console.log('opacity', opacity);
        const clonedMap: Record<string, THREE.Object3D> = []
        const groupRef = React.createRef<THREE.Group>()
        const children: JSX.Element[] = []

        const seen = new Set<string>();
        for (const partName of parts) {

            if (seen.has(partName)) continue;
            seen.add(partName);

            const original = scene.getObjectByName(partName)
            if (!original) {
                console.warn(`Part "${partName}" not found in scene`);
                continue;
            }

            const cloned = original.clone(true)

            cloned.traverse((node) => {
                if ((node as any).isMesh) {
                    const mesh = node as THREE.Mesh
                    const mat = mesh.material
                    const isTransparent = transparent.includes(mesh.name)

                    // const applyMaterial = (sourceMat: any) => {
                    //     const clonedMat = sourceMat.clone()
                    //     clonedMat.transparent = isTransparent
                    //     clonedMat.opacity = isTransparent ? opacity : 1
                    //     clonedMat.depthWrite = !isTransparent
                    //     return clonedMat
                    // }

                    const applyMaterial = (sourceMat: any) => {
                        const clonedMat = sourceMat.clone();
                        const isGlass = isTransparent;

                        clonedMat.transparent = isGlass;
                        clonedMat.opacity = isGlass ? opacity ?? 0.5 : 1;
                        clonedMat.depthWrite = !isGlass;

                        // Enhance for realism
                        if ('metalness' in clonedMat) {
                            clonedMat.metalness = isGlass ? 0 : clonedMat.metalness ?? 0.2;
                            clonedMat.roughness = isGlass ? 0.1 : clonedMat.roughness ?? 0.5;
                            clonedMat.side = THREE.DoubleSide;
                            clonedMat.envMapIntensity = 1;
                        }

                        return clonedMat;
                    };


                    mesh.material = Array.isArray(mat)
                        ? mat.map(applyMaterial)
                        : applyMaterial(mat)

                    mesh.castShadow = true
                    mesh.receiveShadow = !isTransparent
                }
            })

            children.push(
                <primitive key={partName} object={cloned} />
            )

            clonedMap[partName] = cloned
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
