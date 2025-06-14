import { Environment, useGLTF } from "@react-three/drei"

export default function BigCity(props) {
    const { scene } = useGLTF('/models/bigcity.glb')
    return <>
        <Environment preset="night" />
        <primitive object={scene} {...props} />;
    </>
}