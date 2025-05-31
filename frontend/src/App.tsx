// src/App.tsx

import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import {
  useCompoundBody, Debug, usePlane, Physics, useCylinder,
  CylinderArgs, CylinderProps, PlaneProps, useHeightfield
} from '@react-three/cannon';
import { DirectionalLight, Group, Mesh, Object3D } from 'three';
import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei';

import {
  angularVelocity,
  position,
  rotation, useStore
} from './store';

import { Intro, Help, Editor, LeaderBoard, PickColor } from './ui';
import { Cameras } from './effects';

import { HideMouse, Keyboard } from './controls';
// import { Vehicle } from './models/index';
import { useToggle } from './useToggle';
import { useToggledControl } from './use-toggled-control'
import { Matrix } from './components/Matrix';
import { UI } from './ui/UI';
import { Dashboard } from './ui/dashboard/Dashboard';
import socket from './socket';
import Vehicle from './models/RaycastVehicle/Vehicle';
// import City from './models/City';
// import Ground from './models/Ground';
import * as THREE from 'three';
const url = '/models/ccity_building_set_1.glb';
import { InstancedMesh } from 'three';
import { useMemo } from 'react';
import { clone } from 'lodash-es';
import { connected } from 'process';
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
  // Calculate ground dimensions
  const { scene } = useGLTF(url);
  const boundingBox = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // Ground Component to dynamically adjust based on the bounding box

  function GroundPlane(props: PlaneProps) {
    const [width, depth] = [size.x * .0065, size.z * .0065];
    // console.log("width: "+width+", depth: ", depth);
    const [ref] = usePlane(() => ({
      position: [0, -.01, 0],
      rotation: [-Math.PI / 2, 0, 0], // Make the plane horizontal
      material: 'ground',
      type: 'Static',
      ...props
    }
    ), useRef<Group>(null))

    return (
      <group
        ref={ref}
        receiveShadow
      >
        <mesh receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color="green" />
          <gridHelper args={[width, 100, 0xff0000, 0x00ff00]} />
        </mesh>
      </group>
    );
  }

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

    // // Listen for physics updates from the server
    // function onPhysicsUpdate(physics: PhysicsData){
    //   console.log('physics: ', physics.position)
    //   setPhysics(physics);
    // };

    // socket.on('move', onMove);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('cmdData', onCmdEvent);
    socket.on('error', onError);
    // socket.on('physicsUpdate', onPhysicsUpdate);

    return () => {
      socket.off('cmdData', onCmdEvent);
      socket.off('error', onError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // socket.off('physicsUpdate', onPhysicsUpdate);
      socket.removeAllListeners(`carSim`);
    };
  }, []);

  const [light, setLight] = useState<DirectionalLight | null>(null);
  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows]);

  const ToggledEditor = useToggle(Editor, 'editor');
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor');
  const ToggledStats = useToggle(Stats, 'stats');
  const ToggledDebug = useToggledControl(Debug, '?')

  //  Make sure to handle disconnections and reconnections gracefully if this is intended for production.
  let canvas;
  if (!isConnected && process.env.NODE_ENV === 'production') {
    canvas = <Matrix />;
  } else {
    canvas = (
      <Canvas dpr={[1, 2]}
        //camera={{ fov: 50, position: [0, 5, 15] }}
        shadows
      >
        {/* <fog attach="fog" args={['white',  50, 100]} /> */}
        {/* <color attach="background" args={['#171720']} /> */}
        <Sky sunPosition={[100, 10, 100]} distance={1000} />
        {/* <ambientLight intensity={0.09} /> */}
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
        <PerspectiveCamera
          makeDefault={editor}
          fov={75}
          position={[0, 20, 20]}
        />
        <Physics broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 4,
            friction: 1e-3
          }}
          // gravity={[0, -10, 0]}
          allowSleep={false}
        >
          <ToggledDebug>
            {/* <Terrain /> */}
            <GroundPlane />
            {/* Render multiple cities */}
            {/* Use InstancedMesh for performance */}
            {/* <CityInstanced count={9} gridSize={3} spacing={100} /> */}
            {/* <TiledScene 
              scale = {0.0065}
              tileCount = {1}
              size={size}
            /> */}
            <Pillar position={[size.x * .0065 / 2, 2.5, 0]} userData={{ id: 'pillar-1' }} />
            {/* <Pillar position={[0, 2.5, 0]} userData={{ id: 'pillar-2' }} /> */}
            <Pillar position={[-size.x * .0065 / 2, 2.5, 0]} userData={{ id: 'pillar-3' }} />
            {/* <Pillar position={[0, 2.5, -1*planeWidth/2]} userData={{ id: 'pillar-4' }} /> */}
            {/* <Pillar position={[0, 2.5, -1*planeWidth/2]} userData={{ id: 'pillar-3' }} /> */}
            <Vehicle
              position={[0, 1, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              angularVelocity={[0, 0.5, 0]}
            // position={[(size.x*.0065/2)-57, 1, 20.55]} 
            // rotation={[0, -Math.PI / 2, 0]} 
            // angularVelocity={[0, 0.5, 0]}
            // angularVelocity={[physics.angularVelocity.x, physics.angularVelocity.y, physics.angularVelocity.z]}
            // physics={physics}
            // rotation={[physics.rotation.x, physics.rotation.y, physics.rotation.z]}
            >
              {light && <primitive object={light.target} />}
              <Cameras />
            </Vehicle>
          </ToggledDebug>
        </Physics>
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>
        {/* <OrbitControls /> */}
        <ToggledOrbitControls />
      </Canvas>

    );
  }

  return (
    <>
      <Intro>
        <Suspense fallback={null}>
          {/* Switch canvas to Matrix upon disconnect */}
          <ErrorBoundary >
            {canvas}
          </ErrorBoundary>
          {/* <Dashboard physics={ physics }/> */}
          {/* <Clock /> */}
          <UI cmdEvents={cmdEvents} isConnected={isConnected} />
          <ToggledEditor />
          <Help />
          <ToggledStats />
          <LeaderBoard />
          <PickColor />
          <HideMouse />
          {/* <Keyboard /> */}
        </Suspense>
      </Intro>
    </>
  );
}