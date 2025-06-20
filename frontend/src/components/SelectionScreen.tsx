import React, { Ref, Suspense, useState } from 'react';
import { RotatingCamera } from '../effects/RotatingCamera'; // adjust path
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib';


export default function SelectionScreen({ playerId, children, VehicleComponent, MapComponent }: { playerId: any, children: any, VehicleComponent: any, MapComponent: any }) {
    const controlsRef = useRef<ThreeOrbitControls | null>(null)
    return (
        <>
            <OrbitControls
                ref={controlsRef} // Allows Rotating camera to delay automatic mode
                maxPolarAngle={Math.PI / 2 - 0.05} // just above flat (prevents looking under)
                minPolarAngle={0} // from straight above
                enableZoom={true}
                minDistance={5}
                maxDistance={13}
            /><RotatingCamera
                orbitRef={controlsRef}
                radius={7} speed={0.2} height={3}
                resumeDuration={5}
            />
            <Suspense fallback={null}>
                <VehicleComponent playerId={playerId} />
                <MapComponent />
            </Suspense>
        </>
    );
}
