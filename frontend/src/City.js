import React, { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function City() {
    const gltf = useLoader(
        GLTFLoader,
        process.env.PUBLIC_URL + "layout/city/scene.gltf"
      );

      useEffect(() => {
      }, [gltf]);

  return <primitive object={gltf.scene} />
}