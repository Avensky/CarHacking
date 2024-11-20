// src/App.tsx

import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import { usePlane, Physics } from '@react-three/cannon';
import type { DirectionalLight, Mesh } from 'three';
import { Sky, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei';

import { angularVelocity, position, rotation, useStore } from './store';

import { Intro, Help, Editor, LeaderBoard, PickColor } from './ui';
import { Cameras } from './effects';

import { HideMouse, Keyboard } from './controls';
import { Vehicle } from './models/index';
import { useToggle } from './useToggle';
import socket from './socket';
import { Matrix } from './components/Matrix';
import { UI } from './ui/UI';
import { Dashboard } from './ui/dashboard/Dashboard';

// Ground component
function Ground() {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, -0.1, 0], // Position below y=0
  }));
  // Large plane for ground
  // Green color for the ground
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}
function TiledScene({ scale = [0.0065, 0.0065, 0.0065], tileCount = 2, spacingA = 362.7, spacingB = 152.09 }) {
  const gltf = useGLTF('/models/ccity_building_set_1.glb');

  return (
    <>
      {[...Array(tileCount)].map((_, i) =>
        [...Array(tileCount)].map((_, j) => (
          <primitive
            key={`${i}-${j}`}
            object={gltf.scene.clone()}
            scale={scale}
            position={[i * spacingA, 0, j * spacingB]}
          />
        ))
      )}
    </>
  );
}

// Define the type of cmdEvents. For example, if they are objects:
type CmdEvent = string; // Replace with the actual structure if known

export function App(): JSX.Element {
  // Fullscreen
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const enterFullscreen = async () => {
  const element = document.documentElement;

  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) { // Safari
    await (element as any).webkitRequestFullscreen();
  } else if ((element as any).msRequestFullscreen) { // Older Microsoft Edge
    await (element as any).msRequestFullscreen();
  } else {
    alert('Fullscreen mode is not supported by your browser.');
    return;
  }

  setIsFullscreen(true);

  // Orientation lock after fullscreen
  if (screen.orientation && screen.orientation.lock) {
    try {
      await screen.orientation.lock('landscape');
    } catch (error) {
      console.warn('Orientation lock failed:', error);
    }
  }
};

  // Manage data received from backend
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [cmdEvents, setCmdEvents] = useState<CmdEvent[]>([]);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      // console.log('connected')
    }
    function onDisconnect() {
      setIsConnected(false);
      // console.log('disconnected')
    }
    function onError(value: CmdEvent) {
      setCmdEvents((previous) => [...previous, value]);
    }
    function onCmdEvent(value: CmdEvent) {
      setCmdEvents((previous) => [...previous, value]);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('cmdData', onCmdEvent);
    socket.on('error', onError);

    return () => {
      socket.off('cmdData', onCmdEvent);
      socket.off('error', onError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.removeAllListeners(`carSim`);
    };
  }, []);

  const [light, setLight] = useState<DirectionalLight | null>(null);
  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows]);

  const ToggledEditor = useToggle(Editor, 'editor');
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor');
  const ToggledStats = useToggle(Stats, 'stats');

  let canvas;
  if (!isConnected && process.env.NODE_ENV === 'production') {
    canvas = <Matrix />;
  } else {
    canvas = (
      <Canvas dpr={[1, 2]} shadows>
        <fog attach="fog" args={['white', 0, 500]} />
        <Sky sunPosition={[100, 10, 100]} distance={10000} />
        <ambientLight intensity={0.09} />
        <directionalLight
          ref={setLight}
          position={[0, 50, 150]}
          intensity={1}
          shadow-bias={-0.001}
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
          castShadow
        />
        <PerspectiveCamera makeDefault={editor} fov={75} position={[0, 20, 20]} />
        <Physics broadphase="SAP" defaultContactMaterial={{ contactEquationRelaxation: 4, friction: 1e-3 }}>
          <Vehicle
            angularVelocity={[...angularVelocity]}
            position={[...position]}
            rotation={[...rotation]}
          >
            {light && <primitive object={light.target} />}
            <Cameras />
          </Vehicle>
          <TiledScene />
          <Ground />
        </Physics>
        <ToggledOrbitControls />
      </Canvas>
    );
  }

  return (
    <>
     {/* {!isFullscreen && (
        <div className="fullscreenPrompt">
          <button onClick={enterFullscreen}>
            Enter Fullscreen
          </button>
        </div>
      )} */}

        <Suspense fallback={null}>
          {/* Switch canvas to Matrix upon disconnect */}
          {canvas}
          <Dashboard />
          {/* <Clock /> */}
          <UI cmdEvents={cmdEvents} isConnected={isConnected} />
          <ToggledEditor />
          <Help />
          <ToggledStats />
          <LeaderBoard />
          <PickColor />
          <HideMouse />
          <Keyboard />
        </Suspense>

    </>
  );
}