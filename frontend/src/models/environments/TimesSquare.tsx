import { useGLTF } from "@react-three/drei"

export default function TimesSquare(props) {
    const { scene } = useGLTF('/models/scene.glb')
    return <primitive object={scene} {...props} />;
}