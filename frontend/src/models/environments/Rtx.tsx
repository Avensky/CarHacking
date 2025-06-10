import { useGLTF } from "@react-three/drei"

export default function Rtx(props) {
    // Calculate ground dimensions
    const { scene } = useGLTF('/models/city_rtx.glb')
    return (<group >
        <primitive object={scene} {...props} />
    </group>)
}