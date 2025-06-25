import React, { Ref, Suspense, useState } from 'react';
import { RotatingCamera } from '../effects/RotatingCamera'; // adjust path
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib';


export default function SelectionScreen({ playerId, children, VehicleComponent, MapComponent }: { playerId: any, children: any, VehicleComponent: any, MapComponent: any }) {
    return (
        <>
            <Suspense fallback={null}>
                <VehicleComponent playerId={playerId} >
                    {children}
                </VehicleComponent>
                <MapComponent />
            </Suspense>
        </>
    );
}
