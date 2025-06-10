import { useState } from "react";
import { a, useSpring } from "@react-spring/three";
import { Html } from "@react-three/drei";
import Rtx from '../models/environments/Rtx'
import TimesSquare from '../models/environments/TimesSquare'
import City from '../models/environments/City'
import { Environment } from '@react-three/drei';

const mapPreviews = {
    rtx: <Rtx scale={0.02} />,
    timessquare: <TimesSquare scale={0.056} rotation={[0, -Math.PI / 2, 0]} />,
    snow: <City scale={0.0001} rotation={[0, -Math.PI / 2, 0]} />
};
const maps = [
    { id: "rtx", name: "Rtx City", position: [-2, 0, 0], color: "#EDC9AF" },
    { id: "timessquare", name: "Times Square", position: [2, 0, 0], color: "#228B22" },
    // { id: "snow", name: "Normal City", position: [3, 0, 0], color: "#E0FFFF" }, // Changed from 'city' to 'snow'
];

export default function MapSelector({ onSelect, onBack }) {
    const [hovered, setHovered] = useState(null);
    const [active, setActive] = useState(null);

    return (
        <>
            {/* 3D Content */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="city" />
            {maps.map((map) => (
                <SelectableMap
                    key={map.id}
                    map={map}
                    isHovered={hovered === map.id}
                    isActive={active === map.id}
                    onHover={setHovered}
                    onClick={() => {
                        setActive(map.id);
                        setTimeout(() => onSelect(map.id), 500);
                    }}
                />
            ))}

            <Html position={[0, -2, 0]}>
                <button
                    onClick={onBack}
                    style={{
                        padding: "8px 16px",
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                    }}>
                    Back
                </button>
            </Html>
        </>
    );
}

function SelectableMap({ map, isHovered, isActive, onHover, onClick }) {
    const { scale } = useSpring({ scale: isHovered || isActive ? 1.3 : 1 });

    return (
        <a.group
            position={map.position}
            scale={scale}
            onPointerOver={() => onHover(map.id)}
            onPointerOut={() => onHover(null)}
            onClick={onClick}
        >
            {/* Replace box with actual map preview */}
            {mapPreviews[map.id] ?? (
                <mesh castShadow>
                    <boxGeometry args={[1.5, 1.5, 1.5]} />
                    <meshStandardMaterial color={map.color} />
                </mesh>
            )}

            {/* Label */}
            <Html center position={[0, 1.2, 0]}>
                <div style={{
                    fontSize: 18,
                    fontWeight: 600,
                    background: 'rgba(0,0,0,0.5)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    pointerEvents: 'none'
                }}>
                    {map.name}
                </div>
            </Html>
        </a.group>
    );
}
