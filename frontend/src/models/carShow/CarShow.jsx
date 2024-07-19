/* eslint-disable react/no-unknown-property */
import React from "react"
import {
    CubeCamera,
    Environment,
    OrbitControls,
    PerspectiveCamera,
} from "@react-three/drei"
import { Car } from "./"
import { Ground } from "./Ground.jsx"

export function CarShow() {
    return (
        <>
            {/* Allows camera to orbit around target  */}
            <OrbitControls
                target={[0, 0.55, 0]}
                setPolarAngle={1.55}
                maxPolarAngle={1.65} // how far orbit vertically
                maxDistance={.9}
                minDistance={.9}
                enablePan={false}
            />
            {/* This projection mode is designed to mimic the way the human eye sees.  */}
            <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />

            {/* background color */}
            <color
                args={['#fff']}
                attach="background"
            />

            {/* Creates 6 cameras that render to a WebGLCubeRenderTarget. */}
            <CubeCamera resolution={256} frames={60}>
                {(texture) => (
                    <>
                        <Environment map={texture} />
                        <Car />
                    </>
                )}
            </CubeCamera>
            <Ground />
        </>
    )
}

export default CarShow
