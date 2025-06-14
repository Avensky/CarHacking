import { Environment, Sky, useGLTF } from "@react-three/drei"
import { JSX } from "react/jsx-runtime"

export default function Rtx(props: JSX.IntrinsicAttributes & { [properties: string]: any }) {
    // Calculate ground dimensions
    const { scene } = useGLTF('/models/city_rtx.glb')

    return (<group scale={8}>
        <Environment preset="night" />
        <fog attach="fog" args={['black', 100, 100]} />
        <color attach="background" args={['#171720']} />
        <Sky sunPosition={[100, 10, 100]} distance={1000000} />
        <ambientLight
            // layers={layers} 
            intensity={0.01}
        />
        <directionalLight
            // ref={setLight}
            // layers={layers}
            position={[0, 50, 150]}
            intensity={.01}
            shadow-bias={-0.001}
            shadow-mapSize={[4096, 4096]}
            shadow-camera-left={-150}
            shadow-camera-right={150}
            shadow-camera-top={150}
            shadow-camera-bottom={-150}
            castShadow
        />
        <primitive object={scene} {...props} />
    </group>)
}