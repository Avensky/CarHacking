import { Environment, useGLTF } from "@react-three/drei"

export default function TimesSquare(props) {
    const { scene } = useGLTF('/models/city_time_square.glb')
    return <group scale={8.5}>
        <Environment preset="night" />
        <primitive object={scene} {...props} />;
    </group>
}