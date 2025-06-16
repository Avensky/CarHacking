import { Environment, Sky, useGLTF } from "@react-three/drei"
import { useState } from "react"
import { JSX } from "react/jsx-runtime"
import { DirectionalLight, Layers } from "three"
import { levelLayer } from "../../store"

export default function Rtx(props: JSX.IntrinsicAttributes & { [properties: string]: any }) {

    const layers = new Layers()
    layers.enable(levelLayer)
    const [light, setLight] = useState<DirectionalLight | null>(null)

    // Calculate ground dimensions
    const { scene } = useGLTF('/models/city_rtx.glb')

    return (<group scale={2.5}>
        <Environment preset="night" />
        <fog attach="fog" args={['black', 60, 100]} />
        <Sky sunPosition={[100, 10, 100]} distance={1000000} />
        <pointLight
            position={[0, 5, -10]}
            intensity={0.5}
            color="#ffffff"
        />

        <primitive object={scene} {...props} />
    </group>)
}