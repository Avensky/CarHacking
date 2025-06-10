import { useGLTF } from "@react-three/drei"

export default function Rtx(props) {
    const { scene } = useGLTF('/models/city_rtx.glb')
    return <primitive object={scene} {...props} />;
}