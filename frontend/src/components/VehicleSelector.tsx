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
import { RotatingCamera } from '../effects/RotatingCamera'; // adjust path
import useIdleTimer from '../hooks/useIdleTimer';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import TimesSquare from '../models/environments/TimesSquare';
import City from '../models/environments/City';
import Rtx from '../models/environments/Rtx';

// Add more vehicle types here
const vehicleOptions = [
    { type: 'ae86', name: 'AE86', component: Ae86 },
    { type: 'camaro', name: 'Camaro Zl1', component: Camaro },
    { type: 'tank', name: 'Tank', component: Tank },
];

const mapOptions = [
    { type: 'rtx', name: 'Night Life', component: Rtx },
    { type: 'timesquare', name: 'Time Square', component: TimesSquare },
    { type: 'city', name: 'Urban City', component: City },
];

function VehiclePreview({ index }: { index: number }) {
    const VehicleComponent = vehicleOptions[index].component;
    return (
        <group scale={1.5}>
            <VehicleComponent />
        </group>
    )
}

function MapBackground({ index }: { index: number }) {
    const MapComponent = mapOptions[index].component;
    return <MapComponent scale={8} position={[0, -0.001, 0]} />;
}

export default function VehicleSelector({ playerId, onSpawn }) {
    const layers = new Layers()
    layers.enable(levelLayer)

    const [light, setLight] = useState<DirectionalLight | null>(null)
    const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
    const [vehicleIndex, setVehicleIndex] = useState(0);
    const [mapIndex, setMapIndex] = useState(0);
    const selectedVehicle = vehicleOptions[vehicleIndex];
    const selectedMap = mapOptions[mapIndex];

    const handleVehicleNext = () => setVehicleIndex((prev) => (prev + 1) % vehicleOptions.length);
    const handleVehiclePrev = () => setVehicleIndex((prev) => (prev - 1 + vehicleOptions.length) % vehicleOptions.length);

    const handleMapNext = () => setMapIndex((prev) => (prev + 1) % mapOptions.length);
    const handleMapPrev = () => setMapIndex((prev) => (prev - 1 + mapOptions.length) % mapOptions.length);


    const handleSpawn = () => {
        onSpawn?.({ vehicle: selectedVehicle.type, map: selectedMap.type });
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
                    maxDistance={13}
                // onStart={() => useIdleTimer()} // Optional: call this to delay camera rig

                />

                {/* Auto camera orbit */}
                <RotatingCamera
                    orbitRef={controlsRef}
                    radius={7} speed={0.2} height={3}
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
                    <MapBackground index={mapIndex} />
                    <VehiclePreview index={vehicleIndex} />
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
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={handleVehiclePrev}>←</button>
                    <span style={{ margin: '0 1rem', width: 100 }}>{selectedVehicle.name}</span>
                    <button onClick={handleVehicleNext}>→</button>
                </div>

                <h3 style={{ marginTop: '2rem' }}>{selectedMap.name}</h3>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={handleMapPrev}>←</button>
                    <span style={{ margin: '0 1rem', width: 100 }}>{selectedMap.name}</span>
                    <button onClick={handleMapNext}>→</button>
                </div>
                <button onClick={handleSpawn} style={{ marginTop: 20 }}>Start Game</button>
            </div>
        </div>
    );
}
