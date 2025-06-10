import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Sky } from '@react-three/drei';
import { socket } from '../socket';
import Ae86 from '../models/RaycastVehicle/Ae86';
import Tank from '../models/RaycastVehicle/Tank';
import Camaro from '../models/RaycastVehicle/Camaro';
import { Html } from '@react-three/drei'
import { DirectionalLight, Layers } from 'three';
import { dpr, levelLayer, useStore } from "../store";
import Rtx from '../models/environments/Rtx';
import { RotatingCamera } from '../effects/RotatingCamera'; // adjust path
import useIdleTimer from '../hooks/useIdleTimer';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Add more vehicle types here
const vehicleOptions = [
    { type: 'ae86', name: 'AE86', component: Ae86 },
    { type: 'camaro', name: 'Camaro Zl1', component: Camaro },
    { type: 'tank', name: 'Tank', component: Tank },
];

function VehiclePreview({ index }: { index: number }) {
    const VehicleComponent = vehicleOptions[index].component;
    return (
        <group scale={1.5}>
            <VehicleComponent />
        </group>
    )
}

export default function VehicleSelector({ playerId, onSpawn }) {
    const layers = new Layers()
    layers.enable(levelLayer)

    const [light, setLight] = useState<DirectionalLight | null>(null)
    const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedVehicle = vehicleOptions[selectedIndex];

    const handleNext = () => {
        setSelectedIndex((prev) => (prev + 1) % vehicleOptions.length);
    };

    const handlePrev = () => {
        setSelectedIndex((prev) =>
            (prev - 1 + vehicleOptions.length) % vehicleOptions.length
        );
    };

    const handleSpawn = () => {
        onSpawn?.(selectedVehicle.type);
    };

    const controlsRef = useRef();

    return (
        <div
            className="vehicle-selector" style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas
                key={`${dpr}${shadows}`}
                dpr={[1, dpr]}
                shadows
                camera={{ fov: 60, position: [2, 5, 10] }}
            >
                <fog attach="fog" args={['BLACK', 20, 500]} />
                <OrbitControls
                    ref={controlsRef}
                    maxPolarAngle={Math.PI / 2 - 0.05} // just above flat (prevents looking under)
                    minPolarAngle={0} // from straight above
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={10}
                // onStart={() => useIdleTimer()} // Optional: call this to delay camera rig

                />

                {/* Auto camera orbit */}
                <RotatingCamera
                    orbitRef={controlsRef}
                    radius={5} speed={0.2} height={2}
                    resumeDuration={5}
                />

                {/* <Sky sunPosition={[100, 10, 100]} distance={1000} /> */}
                <ambientLight layers={layers} intensity={0.01} />
                <directionalLight
                    ref={setLight}
                    layers={layers}
                    position={[0, 50, 150]}
                    intensity={.01}
                    shadow-bias={-0.001}
                    shadow-mapSize={[4096, 4096]}
                    shadow-camera-left={-150}
                    shadow-camera-right={150}
                    shadow-camera-top={150}
                    shadow-camera-bottom={-150}
                    castShadow
                />
                <Suspense fallback={null}>
                    <Environment preset="night" />
                    <Rtx scale={8} position={[0, -0.001, 0]} />
                    <VehiclePreview
                        index={selectedIndex}
                    />
                </Suspense>
            </Canvas>
            {/* UI controls fixed on screen */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    textAlign: 'center',
                    userSelect: 'none',
                }}
            >
                <h2>{selectedVehicle.name}</h2>
                <div style={{ marginTop: '1rem', display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={handlePrev}>←</button>
                    <span style={{ margin: '0 1rem', width: 100 }}>{selectedVehicle.name}</span>
                    <button onClick={handleNext}>→</button>
                </div>
                <button onClick={handleSpawn} style={{ marginTop: 10 }}>Select Vehicle</button>
            </div>
        </div>
    );
}
