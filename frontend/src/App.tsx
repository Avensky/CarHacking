import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, forwardRef } from 'react'
import { useBox, Physics } from '@react-three/cannon'
import type { DirectionalLight } from 'three'
import * as THREE from 'three' // Add this import
import { usePlane } from '@react-three/cannon'
import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei'

import { angularVelocity, levelLayer, position, rotation, useStore } from './store'

import { Clock, Speed, Intro, Help, Editor, LeaderBoard, Finished, PickColor } from './ui'
import { Cameras } from './effects'

import { HideMouse, Keyboard } from './controls'
import { Vehicle } from './models/index'
import { useToggle } from './useToggle'
// FROM ME
import socket from './socket'
import { Matrix } from './components/Matrix'
import { UI } from './ui/UI'

// Ground component
function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, -0.1, 0], // Position below y=0
  }))
  // Large plane for ground
  // Green color for the ground
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}

function TiledScene({ scale = [0.0065, 0.0065, 0.0065], tileCount = 2, spacingA = 362.7, spacingB = 152.09 }) {
  const gltf = useGLTF('/models/ccity_building_set_1.glb')

  return (
    <>
      {[...Array(tileCount)].map((_, i) =>
        [...Array(tileCount)].map((_, j) => (
          <primitive key={`${i}-${j}`} object={gltf.scene.clone()} scale={scale} position={[i * spacingA, 0, j * spacingB]} />
        )),
      )}
    </>
  )
}

export function App(): JSX.Element {
  // MANGE DATA RECIEVED FROM BACKEND
  // const [error, setError] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [carSim, setcarSim] = useState({
    speed:0,
    rmps:0,
    gas:0,
    temp:0,
  })
  const [cmdEvents, setCmdEvents] = useState([])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
      // console.log('connected')
    }
    function onDisconnect() {
      setIsConnected(false)
      // console.log('disconnected')
    }
    function onCarSim(value: any) {
      // console.log(value)
      setcarSim(value)
    }
    function onError(value: any) {
      // console.log(value)
      setCmdEvents((previous) => [...previous, value])
    }
    function onCmdEvent(value: any) {
      // console.log(value)
      setCmdEvents((previous) => [...previous, value])
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('carSim', onCarSim)
    socket.on('cmdData', onCmdEvent)
    socket.on('error', (err) => {
      onError(err)
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(`carSim`, onCarSim)
      socket.removeAllListeners(`carSim`)
      socket.off('cmdData', onCmdEvent)
      socket.off('error', onError)
    }
  }, [])

  let canvas: any
  if (!isConnected) {
    canvas = <Matrix />
  } else {
    canvas = null
  }
  // from game
  const [light, setLight] = useState<DirectionalLight | null>(null)

  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
  

  const ToggledEditor = useToggle(Editor, 'editor')
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
  const ToggledStats = useToggle(Stats, 'stats')
  
  return (
    <>
      <Intro>
        <Suspense fallback={null}>
          {/* switch to Matrix upon disconnect */}
          {/* {canvas} */}
          {/* Load actual Canvas */}
          <Canvas>
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
                carSim={carSim}
              >
                {light && <primitive object={light.target} />}
                <Cameras />
              </Vehicle>
              <TiledScene />
              <Ground />
            </Physics>
            <ToggledOrbitControls />
          </Canvas>
          {/* <Clock /> */}
          <UI cmdEvents={cmdEvents} isConnected={isConnected} />
          <ToggledEditor />
          <Help />
          <Speed />
          <ToggledStats />
          <LeaderBoard />
          <PickColor />
          <HideMouse />
          <Keyboard />
        </Suspense>
      </Intro>
    </>
  )
}
