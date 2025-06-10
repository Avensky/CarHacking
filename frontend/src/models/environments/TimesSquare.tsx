import { useGLTF } from "@react-three/drei"

export default function TimesSquare(props) {
    const { scene } = useGLTF('/models/city_time_square.glb')
    return <primitive object={scene} {...props} />;
}