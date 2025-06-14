import { Environment, useGLTF } from "@react-three/drei"

export default function Garage(props) {
    // Calculate ground dimensions
    const { scene } = useGLTF('/models/garage.glb')

    return (<group position={[0, -80, 0]}>
        <primitive object={scene} {...props} />
        <Environment preset="night" />s
    </group>)
}