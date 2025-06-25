import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore, getState } from '../store';

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

export function RotatingCamera({ radius = 5, height = 2, speed = 0.3, resumeDuration = 10, orbitRef }) {
    const { camera } = useThree();
    // const angleRef = useRef(0);
    const angle = useStore((s) => s.rotatingCamera.angle);
    const setRotatingCamera = useStore((s) => s.setRotatingCamera);
    const [paused, setPaused] = useState(false);
    const resumeTimer = useRef<number | null>(null);
    const resumeStart = useRef<number | null>(null);
    // const screen = useStore((s) => s.screen);
    const lastVehicleIdRef = useRef<string | null>(null);

    useEffect(() => {
        const controls = orbitRef?.current;
        if (!controls) return;

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
    }, [orbitRef.current, resumeDuration]);

    useFrame(() => {
        const screen = getState().screen;
        if (paused || screen !== "selection-screen") return;
        const physicsData = getState().physicsData;
        const vehicleId = getState().vehicleConfig?.id; // or use playerId if static


        // Reset angle if vehicle changed
        if (vehicleId !== lastVehicleIdRef.current) {
            lastVehicleIdRef.current = vehicleId;
            // angleRef.current = 0; // 👈 Restart rotation from front
        }

        const target = physicsData?.chassisBody?.position ?? new THREE.Vector3(0, 0, 0);
        if (!target) return; // 👈 vehicle not ready yet

        // angleRef.current += speed * 0.01;
        // const angle = angleRef.current;

        const newAngle = angle + speed * 0.01;
        setRotatingCamera({ angle: newAngle });

        const x = radius * Math.sin(newAngle);
        const z = radius * Math.cos(newAngle);
        const desiredPos = new THREE.Vector3(x, height, z);
        const lerpAlpha = Math.min(0.02, desiredPos.distanceTo(camera.position) * 0.05);
        camera.position.lerp(desiredPos, lerpAlpha);
        // camera.lookAt(0, 0, 0);


        camera.lookAt(target.x, target.y, target.z);
    });

    return null;
}
