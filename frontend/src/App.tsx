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
const layers = new Layers()
layers.enable(levelLayer)


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

  // Calculate ground dimensions
  const { scene } = useGLTF(url);
  const { scene: cityScene } = useGLTF('/models/city_rtx.glb')
  const city = useMemo(() => clone(cityScene), [cityScene])

  const boundingBox = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

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

    return () => {
      socket.off('cmdData', onCmdEvent);
      socket.off('error', onError);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.removeAllListeners(`carSim`);
    };
  }, []);


  //  Make sure to handle disconnections and reconnections gracefully if this is intended for production.
  let canvas;
  if (!isConnected && process.env.NODE_ENV === 'production') {
    canvas = <Matrix />;
  } else {
    canvas = (
      <Canvas
        key={`${dpr}${shadows}`}
        dpr={[1, dpr]}
        shadows={shadows}
        camera={{ position: [0, 5, 15], fov: 50 }}
      >
        <fog attach="fog" args={['white', 50, 100]} />
        {/* <color attach="background" args={['#171720']} /> */}
        <Sky sunPosition={[100, 10, 100]} distance={1000} />
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
        <PerspectiveCamera
          makeDefault={editor}
          fov={75}
          position={[0, 20, 20]}
        />
        {/* <Physics broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 4,
            friction: 1e-3
          }}
          // gravity={[0, -10, 0]}
          allowSleep={false}
        > */}
        <ToggledDebug>
          {/* <Terrain /> */}
          {/* <GroundPlane /> */}
          {/* Render multiple cities */}
          {/* Use InstancedMesh for performance */}
          {/* <CityInstanced count={9} gridSize={3} spacing={100} /> */}
          {/* <TiledScene 
              scale = {0.0065}
              tileCount = {1}
              size={size}
            /> */}
          {/* <Pillar position={[size.x * .0065 / 2, 2.5, 0]} userData={{ id: 'pillar-1' }} /> */}
          {/* <Pillar position={[0, 2.5, 0]} userData={{ id: 'pillar-2' }} /> */}
          {/* <Pillar position={[-size.x * .0065 / 2, 2.5, 0]} userData={{ id: 'pillar-3' }} /> */}
          {/* <Pillar position={[0, 2.5, -1*planeWidth/2]} userData={{ id: 'pillar-4' }} /> */}
          {/* <Pillar position={[0, 2.5, -1*planeWidth/2]} userData={{ id: 'pillar-3' }} /> */}

          <group scale={2} position={[0, 0, 0]}>
            <primitive object={city} />
          </group>
          <Vehicle>
            {light && <primitive object={light.target} />}
            <Cameras />
          </Vehicle>
        </ToggledDebug>
        {/* </Physics> */}
        <Environment preset="night" />

        <Environment files="textures/dikhololo_night_1k.hdr" />
        <ToggledMap />
        <ToggledOrbitControls />
      </Canvas >

    );
  }

  return (
    <>
      <Suspense fallback={null}>
        {/* Switch canvas to Matrix upon disconnect */}

        <ErrorBoundary >

          <Intro>
            {canvas}
            <Clock />
            <ToggledEditor />
            <ToggledFinished />
            <Help />
            <Speed />
            <ToggledStats />
            {/* <ToggledCheckpoint /> */}
            <LeaderBoard />
            <PickColor />
            <HideMouse />
            <Keyboard />
          </Intro>
        </ErrorBoundary>
        {/* <Dashboard physics={ physics }/> */}
        {/* <Clock /> */}
        <UI cmdEvents={cmdEvents} isConnected={isConnected} />
      </Suspense>
    </>
  );
}