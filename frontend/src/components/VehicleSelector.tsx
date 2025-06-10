import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { socket } from '../socket';
import Ae86 from '../models/RaycastVehicle/Ae86';
import Tank from '../models/RaycastVehicle/Tank';
import Camaro from '../models/RaycastVehicle/Camaro';
import { Html } from '@react-three/drei'

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
    );
}

export default function VehicleSelector({ playerId, onSpawn }) {
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

    return (
        <div
            className="vehicle-selector" style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <OrbitControls enableZoom={false} />
                <VehiclePreview index={selectedIndex} />
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
