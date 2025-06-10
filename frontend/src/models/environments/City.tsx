import { useGLTF } from "@react-three/drei"

export default function City(props) {
    const { scene } = useGLTF('/models/ccity_building_set_1.glb')
    return <primitive object={scene} {...props} />;
}