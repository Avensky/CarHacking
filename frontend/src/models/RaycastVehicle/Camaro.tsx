// Camaro.tsx
import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

export default function Camaro(props) {
    const group = useRef<Group>();
    const { scene } = useGLTF('/models/cars/camaroZOriginal.glb');

    return (
        <group ref={group} {...props} scale={0.01} position={[0, 0, 0]}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload('/models/cars/camaroZOriginal.glb');
