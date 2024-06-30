import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import {
  CubeCamera,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import "./style.css";
import { Boxes } from "./Boxes";
import { Car } from "./Car";
import { City } from "./City";
import { Ground } from "./Ground";
import { FloatingGrid } from "./FloatingGrid";
import { Rings } from "./Rings";

function CarShow() {
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
      <color args={['#fff']} attach="background" />

      {/* Creates 6 cameras that render to a WebGLCubeRenderTarget. */}
      <CubeCamera resolution={256} frames={Infinity}>
        {(texture) => (
          <>
            <Environment map={texture} />
            {/* <City /> */}
            <Car />
          </>
        )}
      </CubeCamera>

      {/* This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets. */}
      {/* <spotLight
        color={[1, 0.25, 0.7]}
        intensity={1.5}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      /> */}

      {/* <spotLight
        color={[0.14, 0.5, 1]}
        intensity={2}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      /> */}
      <Ground />
      {/* <FloatingGrid /> */}
      {/* <Boxes /> */}
      {/* <Rings /> */}

      <EffectComposer>
        {/* <DepthOfField focusDistance={0.0035} focalLength={0.01} bokehScale={3} height={480} /> */}
        {/* <Bloom        blendFunction={BlendFunction.ADD}
          intensity={1.3} // The bloom intensity.
          width={300} // render width
          height={300} // render height
          kernelSize={5} // blur kernel size
          luminanceThreshold={0.15} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
        /> */}
        {/* <ChromaticAberration
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={[0.0005, 0.0012]} // color offset
        /> */}
      </EffectComposer>

    </>
  );
}

function App() {
  return (
    <Suspense fallback={null}>
      <Canvas shadows>
        <CarShow />
      </Canvas>
    </Suspense>
  );
}

export default App;
