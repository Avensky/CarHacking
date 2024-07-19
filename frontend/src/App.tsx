/* eslint-disable react/no-unknown-property */
import type { SetStateAction } from 'react'
import { useState, useEffect } from 'react'
import { Layers } from 'three'
import { Canvas } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/cannon'
import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei'

import type { DirectionalLight } from 'three'

import { HideMouse, Keyboard } from './controls'
import { Cameras } from './effects'
import { BoundingBox, Ramp, Track, Vehicle, Goal, Train, Heightmap } from './models'
import { angularVelocity, levelLayer, position, rotation, useStore } from './store'
import { Checkpoint, Clock, Speed, Minimap, Intro, Help, Editor, LeaderBoard, Finished, PickColor } from './ui'
import { useToggle } from './useToggle'

const layers = new Layers()
layers.enable(levelLayer)

// FROM ME
import { socket } from './socket.js'
import { Matrix } from './components/Matrix'
import { Dashboard } from './ui/dashboard'
import { Console } from './ui/console/Index'
export function App(): JSX.Element {

  // FROM ME
  const start = { speed: 0, rpms: 0, fuel: 0, temp: 0 }

  // MANGE DATA RECIEVED FROM BACKEND
  // const [error, setError] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [carEvents, setCarEvents] = useState(start)
  const [cmdEvents, setCmdEvents] = useState([])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
      console.log('connected')
    }
    function onDisconnect() {
      setIsConnected(false)
      console.log('disconnected')
    }
    function onCarSim(value: SetStateAction<{ speed: number; rpms: number; fuel: number; temp: number }>) { setCarEvents(value) }
    // function onError(value) {
    //   setError(value);
    //   console.log('setError', value);
    // }
    function onCmdEvent(value: any) {
      console.log(value)
      setCmdEvents(
        previous => [...previous, value]
      )
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('carSim', onCarSim)
    socket.on('cmdData', onCmdEvent)
    // socket.on('error', (err) => {
    //   onError(err);
    // });

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(`carSim`, onCarSim)
      socket.removeAllListeners(`carSim`)
      socket.off('cmdData', onCmdEvent)
      // socket.off('error', setError);
    }
    // eslint-disable-next-line
  }, []);

  let canvas
  !isConnected
    ? canvas = <Matrix />
    : canvas = null

  //From game
  const [light, setLight] = useState<DirectionalLight | null>(null)
  const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
  const { onCheckpoint, onFinish, onStart } = actions

  const ToggledCheckpoint = useToggle(Checkpoint, 'checkpoint')
  const ToggledDebug = useToggle(Debug, 'debug')
  const ToggledEditor = useToggle(Editor, 'editor')
  const ToggledFinished = useToggle(Finished, 'finished')
  const ToggledMap = useToggle(Minimap, 'map')
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
  const ToggledStats = useToggle(Stats, 'stats')

  return (
    <Intro>
      {/* Load Matrix upon disconnect */}
      {canvas}
      {/* CONTENT FORM ME  */}
      <Canvas key={`${dpr}${shadows}`} dpr={[1, dpr]} shadows={shadows} camera={{ position: [0, 5, 15], fov: 50 }}>
        <fog attach="fog" args={['white', 0, 500]} />
        <Sky sunPosition={[100, 10, 100]} distance={1000} />
        <ambientLight layers={layers} intensity={0.1} />
        <directionalLight
          ref={setLight}
          layers={layers}
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
        <Physics allowSleep broadphase="SAP" defaultContactMaterial={{ contactEquationRelaxation: 4, friction: 1e-3 }}>
          <ToggledDebug scale={1.0001} color="white">
            <Vehicle angularVelocity={[...angularVelocity]} position={[...position]} rotation={[...rotation]}>
              {light && <primitive object={light.target} />}
              <Cameras />
            </Vehicle>
            <Train />
            <Ramp args={[30, 6, 8]} position={[2, -1, 168.55]} rotation={[0, 0.49, Math.PI / 15]} />
            <Heightmap elementSize={0.5085} position={[327 - 66.5, -3.3, -473 + 213]} rotation={[-Math.PI / 2, 0, -Math.PI]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onStart} rotation={[0, 0.55, 0]} position={[-27, 1, 180]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onFinish} rotation={[0, -1.2, 0]} position={[-104, 1, -189]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onCheckpoint} rotation={[0, -0.5, 0]} position={[-50, 1, -5]} />
            <BoundingBox {...{ depth: 512, height: 100, position: [0, 40, 0], width: 512 }} />
          </ToggledDebug>
        </Physics>
        <Track />
        <Environment files="textures/dikhololo_night_1k.hdr" />
        <ToggledMap />
        <ToggledOrbitControls />
      </Canvas>
      <Clock />
      <ToggledEditor />
      <ToggledFinished />
      <Console isConnected={isConnected} cmdEvents={cmdEvents} />
      <Help />
      <Speed />
      <Dashboard events={carEvents || start} />
      <ToggledStats />
      <ToggledCheckpoint />
      <LeaderBoard />
      <PickColor />
      <HideMouse />
      <Keyboard />
    </Intro>
  )
}
