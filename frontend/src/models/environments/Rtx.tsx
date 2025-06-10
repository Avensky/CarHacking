import { useGLTF } from "@react-three/drei"
import { clone } from "lodash-es";
import { useMemo } from "react";
import * as THREE from "three";


export default function Rtx(props) {
    // Calculate ground dimensions
    const { scene } = useGLTF('/models/city_rtx.glb')
    // const { scene: cityScene } = useGLTF('/models/city_rtx.glb')
    // const city = useMemo(() => clone(cityScene), [cityScene])

    // const boundingBox = new THREE.Box3().setFromObject(scene);
    // const size = new THREE.Vector3();
    // boundingBox.getSize(size);

    return (<group >
        <primitive object={scene} {...props} />
    </group>)
}