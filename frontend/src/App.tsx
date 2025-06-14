// src/App.tsx
import SelectionScreen from './components/SelectionScreen';
import { Suspense, useRef, useState, useEffect } from 'react';
import { DirectionalLight, Group, Layers, Mesh, Object3D } from 'three';
import { getState, levelLayer, useStore } from './store'
// import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei';
// import { Checkpoint, Clock, Speed, Minimap, Intro, Help, Editor, LeaderBoard, Finished, PickColor } from './ui'
import { HideMouse, Keyboard } from './controls';
// import { useToggle } from './useToggle';
import socket from './socket';
import * as THREE from 'three';
import GameScene from "./components/GameScene"; // your main game view
import SelectionUI from './components/SelectionUI';
import { Canvas } from '@react-three/fiber';
import Rtx from './models/environments/Rtx';

import TimesSquare from './models/environments/TimesSquare';
import Ae86 from './models/RaycastVehicle/Ae86';

import Camaro from './models/RaycastVehicle/Camaro';
import Tank from './models/RaycastVehicle/Tank';
import { Cameras } from './effects';
type Screen = 'selection-screen' | 'game-screen';

// Define the type of cmdEvents. For example, if they are objects:
// type CmdEvent = string; // Replace with the actual structure if known
interface PhysicsData {
  position: THREE.Vector3,
  angularVelocity: THREE.Vector3,
  velocity: THREE.Vector3
}

export function App(): JSX.Element {

  const layers = new Layers()
  layers.enable(levelLayer)
  const [light, setLight] = useState<DirectionalLight | null>(null)
  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
  const [isConnected, setIsConnected] = useState(socket.connected);
  // const ToggledDebug = useToggle(Debug, 'debug')
  // const ToggledEditor = useToggle(Editor, 'editor')
  // const ToggledFinished = useToggle(Finished, 'finished')
  // const ToggledMap = useToggle(Minimap, 'map')
  // const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
  // const ToggledStats = useToggle(Stats, 'stats')

  const vehicleOptions = [
    { type: 'ae86', name: 'AE86', component: Ae86 },
    { type: 'camaro', name: '2017 Camaro', component: Camaro },
    { type: 'tank', name: 'Tank', component: Tank },
  ];

  const mapOptions = [
    { type: 'rtx', name: 'Night Life', component: Rtx },
    { type: 'timesquare', name: 'Time Square', component: TimesSquare },
  ];

  const [screen, setScreen] = useState<Screen>("selection-screen");
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ae86');
  const [selectedMap, setSelectedMap] = useState<string>('rtx');
  const [vehicleIndex, setVehicleIndex] = useState(0);
  const [mapIndex, setMapIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    function onConnect() {
      console.log('✅ PayerID:', socket.id)
      setIsConnected(true);
      console.log('Welcome, connection: ', socket.connected)
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Good bye, disconnecting...')
    }

    function onError(value: any) {
      // setCmdEvents((previous) => [...previous, value]);
    }

    function onCmdEvent(value: any) {
      // setCmdEvents((previous) => [...previous, value]);
    }

    const handlePhysicsUpdate = (data: PhysicsData) => {
      // console.log("handle physics data", data)
      getState().setPhysicsData(data); // <--- this must be implemented in store
    }

    function handleSpawnPlayer(data: { vehicle: string, map: string }) {
      console.log('🚗 Player Spawned:', data);
      setSelectedVehicle(data.vehicle);
      setSelectedMap(data.map);
      setScreen('game-screen');
    }

    // socket.on('move', onMove);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('cmdData', onCmdEvent);
    socket.on('error', onError);
    socket.on('physicsUpdate', handlePhysicsUpdate)
    socket.on('spawnPlayer', handleSpawnPlayer)

    return () => {
      socket.off('spawnPlayer', handleSpawnPlayer);
      socket.off('physicsUpdate', handlePhysicsUpdate);
      socket.off('cmdData', onCmdEvent);
      socket.off('error', onError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.removeAllListeners(`carSim`);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        key={`${dpr}${shadows}`}
        dpr={[1, dpr]}
        shadows
        camera={{ fov: 60, position: [2, 5, 10] }}
      >
        <Suspense fallback={null}>
          {screen === 'selection-screen' && (
            <SelectionScreen
              VehicleComponent={vehicleOptions[vehicleIndex].component}
              MapComponent={mapOptions[mapIndex].component}
            >
              {light && <primitive object={light.target} />}
              <Cameras />
            </SelectionScreen>
          )}
          {screen === 'game-screen' && selectedVehicle && selectedMap && (
            <GameScene
              playerId={socket.id}
              VehicleComponent={vehicleOptions[vehicleIndex].component}
              MapComponent={mapOptions[mapIndex].component}
            >
              <Cameras />
            </GameScene>
          )}
        </Suspense>
      </Canvas>
      {screen === 'selection-screen' && (
        <SelectionUI
          handleVehicleNext={() => setVehicleIndex((prev) => (prev + 1) % vehicleOptions.length)}
          handleVehiclePrev={() => setVehicleIndex((prev) => (prev - 1 + vehicleOptions.length) % vehicleOptions.length)}
          handleMapNext={() => setMapIndex((prev) => (prev + 1) % mapOptions.length)}
          handleMapPrev={() => setMapIndex((prev) => (prev - 1 + mapOptions.length) % mapOptions.length)}
          vehicleName={vehicleOptions[vehicleIndex].name}
          mapName={mapOptions[mapIndex].name}
          handleSpawn={() => {
            const vehicle = vehicleOptions[vehicleIndex].type;
            const map = mapOptions[mapIndex].type;
            socket.emit('spawnPlayer', { vehicle, map });
          }
          }
        />
      )}
      <HideMouse />
      <Keyboard />
      {/* <Dashboard physics={ physics }/> */}
      {/* <Clock /> */}
      {/* <UI cmdEvents={cmdEvents} isConnected={isConnected} /> */}
    </div>
  );
}