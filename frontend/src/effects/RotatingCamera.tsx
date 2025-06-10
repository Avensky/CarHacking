import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

export function RotatingCamera({ radius = 5, height = 2, speed = 0.3, resumeDuration = 10, orbitRef }) {
    const { camera } = useThree();
    const angleRef = useRef(0);
    const [paused, setPaused] = useState(false);
    const resumeTimer = useRef<number | null>(null);
    const resumeStart = useRef<number | null>(null);

    useEffect(() => {
        if (!orbitRef?.current) return;

        const controls = orbitRef.current;

        const onStart = () => {
            setPaused(true);
            resumeStart.current = null;
            if (resumeTimer.current) {
                clearTimeout(resumeTimer.current);
                resumeTimer.current = null;
            }
        };

        const onEnd = () => {
            resumeStart.current = performance.now();
            resumeTimer.current = window.setTimeout(() => {
                setPaused(false);
                resumeTimer.current = null;
            }, resumeDuration * 1000);
        };

        controls.addEventListener('start', onStart);
        controls.addEventListener('end', onEnd);

        return () => {
            controls.removeEventListener('start', onStart);
            controls.removeEventListener('end', onEnd);
        };
    }, [orbitRef, resumeDuration]);

    useFrame(() => {
        if (paused) return;

        angleRef.current += speed * 0.01;
        const angle = angleRef.current;
        const x = radius * Math.sin(angle);
        const z = radius * Math.cos(angle);
        const desiredPos = new THREE.Vector3(x, height, z);

        camera.position.lerp(desiredPos, 0.02);
        camera.lookAt(0, 0, 0);
    });

    return null;
}
