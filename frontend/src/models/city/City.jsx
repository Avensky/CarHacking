/* eslint-disable react/no-unknown-property */
import React, { useEffect } from "react"
// import { useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
// import { Mesh } from "three"

export function City() {
    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "models/city/ccity_building_set_1.glb",
        // process.env.PUBLIC_URL + "models/",
    )

    useEffect(() => {
        // gltf.scene.scale.set(0.15, 0.15, 0.15);
        // gltf.scene.position.set(0.01, 0.01, 0.01);
        // gltf.scene.traverse((object) => {
        //     if (object instanceof Mesh) {
        //         object.castShadow = true;
        //         object.receiveShadow = true;
        //         object.material.envMapIntensity = 20;
        //     }
        // });
    }, [gltf])

    return <primitive object={gltf.scene} />
}
