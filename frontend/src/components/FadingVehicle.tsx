// components/FadingVehicle.tsx
import { a, useSpring } from '@react-spring/three';
import { useEffect, useState } from 'react';

export function FadingVehicle({ Component, visible }: { Component: any; visible: boolean }) {
    const [mounted, setMounted] = useState(visible);

    const { opacity, scale } = useSpring({
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.9,
        config: { tension: 120, friction: 20 },
        onRest: () => {
            if (!visible) setMounted(false);
        },
    });

    useEffect(() => {
        if (visible) setMounted(true);
    }, [visible]);

    return mounted ? (
        <a.group scale={scale} rotation-y={0} position={[0, 0, 0]} >
            <a.group scale={1} position={[0, 0, 0]} opacity={opacity}>
                <Component />
            </a.group>
        </a.group>
    ) : null;
}
