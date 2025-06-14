import { Environment, Sky, useGLTF } from "@react-three/drei"
import { JSX } from "react/jsx-runtime"

export default function City(props: JSX.IntrinsicAttributes & { [properties: string]: any }) {
    const { scene } = useGLTF('/models/ccity_building_set_1.glb')
    return <>
        <Environment preset="night" />
        <fog attach="fog" args={['white', 50, 100]} />
        <color attach="background" args={['#171720']} />
        <Sky sunPosition={[100, 10, 100]} distance={1000} />
        <ambientLight
            // layers={layers} 
            intensity={0.01} />
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
        <primitive object={scene} {...props} />;
    </>
}
