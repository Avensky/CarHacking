import { Environment, useGLTF } from "@react-three/drei"

export default function VirtualCity(props) {
    const { scene } = useGLTF('/models/virtualCity.glb')
    return <group scale={8}>
        <Environment preset="night" />
        <primitive object={scene} {...props} />;
    </group>
}