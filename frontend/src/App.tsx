// src/App.tsx

import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import {
  useCompoundBody, Debug, usePlane, Physics, useCylinder,
  CylinderArgs, CylinderProps, PlaneProps, useHeightfield
} from '@react-three/cannon';
import { DirectionalLight, Group, Layers, Mesh, Object3D } from 'three';
import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei';

import { levelLayer, useStore } from './store'

import { Checkpoint, Clock, Speed, Minimap, Intro, Help, Editor, LeaderBoard, Finished, PickColor } from './ui'
// import { Cameras } from './effects';

import { HideMouse, Keyboard } from './controls';
// import { Vehicle } from './models/index';
import { useToggle } from './useToggle';
// import { useToggledControl } from './use-toggled-control'
// import { Matrix } from './components/Matrix';
import { UI } from './ui/UI';
// import { Dashboard } from './ui/dashboard/Dashboard';
import socket from './socket';
// import Vehicle from './models/RaycastVehicle/Vehicle';
// import City from './models/City';
// import Ground from './models/Ground';
import * as THREE from 'three';
const url = '/models/ccity_building_set_1.glb';
// import { InstancedMesh } from 'three';
// import { useMemo } from 'react';
// import { clone } from 'lodash-es';
// import { connected } from 'process';

// import VehicleSelector from "./components/VehicleSelector"; // update path as needed
import MapSelector from "./components/MapSelector";
// import GameModeSelector from "./components/GameModeSelector";
import GameScene from "./components/GameScene"; // your main game view
// import { Screen } from "./types";
import { Html } from '@react-three/drei';
type Screen = 'vehicle-select' | 'map-select' | 'game';

interface CityProps {
  size: THREE.Vector3;
  position: [number, number, number];
  scale: number;
  key: string;
}
interface vehicleProps {
  position: THREE.Vector3,
  rotation: THREE.Vector3,
  angularVelocity: THREE.Vector3,
  velocity: THREE.Vector3
}
interface TileProps {
  size: THREE.Vector3;
  scale: number;
  tileCount: number;
}

// Define the type of cmdEvents. For example, if they are objects:
type CmdEvent = string; // Replace with the actual structure if known
interface PhysicsData {
  position: THREE.Vector3,
  angularVelocity: THREE.Vector3,
  velocity: THREE.Vector3
}

import React from 'react'
import type { ReactNode } from 'react';
import VehicleSelector from './components/VehicleSelector';
import Matrix from './components/Matrix';
import Ae86 from './models/RaycastVehicle/Ae86';
import Camaro from './models/RaycastVehicle/Camaro';
import Tank from './models/RaycastVehicle/Tank';




class ErrorBoundary extends React.Component<{ children: ReactNode }> {
  state = { hasError: false }

  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Graphics error – try reloading the page.</div>
    }

    return this.props.children
  }
}

export function City({ position, scale = 1 }: CityProps) {
  const gltf = useGLTF('/models/ccity_building_set_1.glb');
  const cityRef = useRef<Object3D>();


  useEffect(() => {
    if (cityRef.current) {
      cityRef.current.position.set(...position);
      cityRef.current.scale.set(scale, scale, scale);
    }
  }, [position, scale]);

  return (
    <primitive
      // key={id}
      ref={cityRef}
      object={gltf.scene.clone()}
    />

  );
}

function TiledScene({ size, scale, tileCount }: TileProps) {
  // Define grid parameters
  const width = size.x * .0065; // Distance between cities
  const depth = size.z * .0065; // Distance between cities
  return (
    <>
      {[...Array(tileCount)].map((_, i) =>
        [...Array(tileCount)].map((_, j) => (
          <City
            key={`${i}-${j}`}
            scale={scale}
            size={size}
            position={[(i * width) + 69.55, 0, (j * depth) + 69.55]}
          />
        ))
      )}
    </>
  );
}


function Pillar(props: CylinderProps) {
  const args: CylinderArgs = [0.7, 0.7, 5, 16]
  const [ref] = useCylinder<Mesh>(
    () => ({
      args,
      mass: 10,
      ...props,
    }),
    useRef<Mesh>(null),
  )
  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={args} />
      <meshNormalMaterial />
    </mesh>
  )
}



export function App(): JSX.Element {
  const vehicleMap = {
    ae86: Ae86,
    camaro: Camaro,
    tank: Tank,
  };
  // const layers = new Layers()
  // layers.enable(levelLayer)

  const [physicsData, setPhysicsData] = useState<PhysicsData | null>(null)
  const [screen, setScreen] = useState<Screen>("vehicle-select");
  const [selectedVehicle, setSelectedVehicle] = useState<"ae86" | "tank" | "camaro" | null>(null);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [light, setLight] = useState<DirectionalLight | null>(null)
  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
  // const { onCheckpoint, onFinish, onStart } = actions
  // const ToggledCheckpoint = useToggle(Checkpoint, 'checkpoint')
  const ToggledDebug = useToggle(Debug, 'debug')
  const ToggledEditor = useToggle(Editor, 'editor')
  const ToggledFinished = useToggle(Finished, 'finished')
  const ToggledMap = useToggle(Minimap, 'map')
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
  const ToggledStats = useToggle(Stats, 'stats')



  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Manage data received from backend
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [cmdEvents, setCmdEvents] = useState<CmdEvent[]>([]);
  // const [socketPosition, setSocketPosition] = useState();
  // const [physics, setPhysics] = useState({});

  useEffect(() => {
    function onConnect() {
      console.log('✅ Socket connected:', socket.id)
      setIsConnected(true);
      console.log('connected: ', socket.connected)
    }
    function onDisconnect() {
      setIsConnected(false);
      console.log('disconnected')
    }
    function onError(value: any) {
      // setCmdEvents((previous) => [...previous, value]);
    }
    function onCmdEvent(value: any) {
      // setCmdEvents((previous) => [...previous, value]);
    }

    // socket.on('move', onMove);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('cmdData', onCmdEvent);
    socket.on('error', onError);
    const handlePhysicsUpdate = (data: PhysicsData) => {
      setPhysicsData(data)
    }
    const handleSpawnVehicle = (data: string | ((prevState: "ae86" | "tank" | "camaro" | null) => "ae86" | "tank" | "camaro" | null) | null) => {
      console.log('data', data);
      setSelectedVehicle(data)
    }

    socket.on('physicsUpdate', handlePhysicsUpdate)
    socket.on('spawnVehicle', handleSpawnVehicle)
    return () => {
      socket.off('spawnVehicle', handleSpawnVehicle);
      socket.off('physicsUpdate', handlePhysicsUpdate);
      socket.off('cmdData', onCmdEvent);
      socket.off('error', onError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.removeAllListeners(`carSim`);
    };
  }, []);

  return (
    <>
      {/* Switch canvas to Matrix upon disconnect */}
      <ErrorBoundary >
        {/* ✅ Background effect */}
        <Matrix />

        {screen === 'vehicle-select' && (
          <VehicleSelector
            playerId={socket.id}
            onSpawn={(type: string | ((prevState: "ae86" | "tank" | "camaro" | null) => "ae86" | "tank" | "camaro" | null) | null) => {
              setSelectedVehicle(type);
              setScreen('map-select');
            }}
          />
        )}
        {screen === 'map-select' && (
          <div style={{ position: 'absolute', width: '100%', height: '100vh' }}>
            <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
              <MapSelector
                onSelect={(mapId) => {
                  setSelectedMap(mapId);
                  setScreen('game');
                }}
                onBack={() => setScreen('vehicle-select')}
              />
            </Canvas>
          </div>
        )}

        {screen === 'game' && selectedVehicle && selectedMap && (
          <GameScene vehicle={vehicleMap[selectedVehicle]} map={selectedMap} />
        )}

        <Keyboard />
        {/* <Dashboard physics={ physics }/> */}
        {/* <Clock /> */}
        {/* <UI cmdEvents={cmdEvents} isConnected={isConnected} /> */}
      </ErrorBoundary>
    </>
  );
}