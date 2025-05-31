import type { BoxProps, WheelInfoOptions } from '@react-three/cannon'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group, Mesh } from 'three'
import * as THREE from 'three';
import type { PropsWithChildren } from 'react'

import { Chassis } from './Chassis'
import { useToggle } from '../../useToggle'
import { useControls } from './use-controls'
import { Wheel } from './Wheel'

import { AccelerateAudio, BoostAudio, Boost, BrakeAudio, Dust, EngineAudio, HonkAudio, Skid } from '../../effects'
import socket from '../../socket'

function allRefsReady(refs: React.RefObject<any>[]) {
  return refs.every(ref => ref.current !== null)
}

interface PhysicsData {
  wheelInfos: Array<{
    position: { x: number; y: number; z: number };
    quaternion: { x: number; y: number; z: number; w: number };
  }>;
  chassisBody: {
    position: THREE.Vector3
    angularVelocity: THREE.Vector3
    velocity: THREE.Vector3
    quaternion: { x: number; y: number; z: number; w: number };
  }
}

type VehicleProps = Required<PropsWithChildren<Pick<BoxProps, 'angularVelocity' | 'position' | 'rotation'>>> & {
  back?: number
  force?: number
  front?: number
  height?: number
  maxBrake?: number
  radius?: number
  steer?: number
  width?: number
}

function Vehicle({
  children,
  angularVelocity,
  position,
  rotation,
  force = 1500,
  maxBrake = 50,
  steer = 0.5,
  back = -1.15,
  front = 1.3,
  height = -0.04,
  radius = 0.7,
  width = 1.2
}: VehicleProps): JSX.Element {
  const [queuedPhysicsUpdate, setQueuedPhysicsUpdate] = useState<PhysicsData | null>(null);
  const ToggledAccelerateAudio = useToggle(AccelerateAudio, ['ready', 'sound'])
  const ToggledEngineAudio = useToggle(EngineAudio, ['ready', 'sound'])
  const controls = useControls()


  const chassisRef = useRef<THREE.Mesh>(null!)

  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      angularVelocity,
      args: [1.7, 1, 4],
      mass: 150,
      onCollide: (e) => console.log('bonk', e.body.userData),
      position,
      rotation,
    }),
    chassisRef,
  )

  const wheels = [useRef<THREE.Group>(null!), useRef<THREE.Group>(null!), useRef<THREE.Group>(null!), useRef<THREE.Group>(null!)]

  const wheelInfo: WheelInfoOptions = {
    axleLocal: [-1, 0, 0],
    customSlidingRotationalSpeed: -30,
    dampingCompression: 4.4,
    dampingRelaxation: 10,
    directionLocal: [0, -1, 0],
    frictionSlip: 2,
    maxSuspensionForce: 1e4,
    maxSuspensionTravel: 0.3,
    radius,
    suspensionRestLength: 0.3,
    suspensionStiffness: 30,
    useCustomSlidingRotationalSpeed: true,
  }

  const wheelInfo1: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [-width / 2, height, front],
    isFrontWheel: true,
  }
  const wheelInfo2: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [width / 2, height, front],
    isFrontWheel: true,
  }
  const wheelInfo3: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [-width / 2, height, back],
    isFrontWheel: false,
  }
  const wheelInfo4: WheelInfoOptions = {
    ...wheelInfo,
    chassisConnectionPointLocal: [width / 2, height, back],
    isFrontWheel: false,
  }

  const vehicleRef = useRef<THREE.Group>(null!);
  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
      wheels,
    }),
    vehicleRef
  );

  useEffect(() => {
    const unsub = vehicleApi.sliding.subscribe((v) => console.log('sliding', v))
    return unsub
  }, [])

  useEffect(() => {
    if (!allRefsReady(wheels)) return;
    const onPhysicsUpdate = (data: PhysicsData) => {
      setQueuedPhysicsUpdate(data);
    }

    socket.on('physicsUpdate', onPhysicsUpdate)
    return () => {
      socket.off('physicsUpdate', onPhysicsUpdate)
    }
  }, [chassisApi, wheels])

  useEffect(() => {
    if (!queuedPhysicsUpdate) return;
    if (!chassisRef.current || !allRefsReady(wheels)) return;

    const { chassisBody, wheelInfos } = queuedPhysicsUpdate;

    if (chassisBody) {
      const { position, velocity, angularVelocity, quaternion } = chassisBody;
      chassisApi.position.set(position.x, position.y, position.z);
      chassisApi.velocity.set(velocity.x, velocity.y, velocity.z);
      chassisApi.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
      chassisApi.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }

    if (wheelInfos) {
      wheelInfos.forEach((wheel, index) => {
        const ref = wheels[index]?.current;
        if (!ref) return;
        ref.position.set(wheel.position.x, wheel.position.y, wheel.position.z);
        ref.quaternion.set(wheel.quaternion.x, wheel.quaternion.y, wheel.quaternion.z, wheel.quaternion.w);
      });
    }

    setQueuedPhysicsUpdate(null); // consume the buffered update
  }, [queuedPhysicsUpdate, wheels, chassisRef]);


  useFrame(() => {
    if (chassisRef.current) {
      chassisApi.position.subscribe(([x, y, z]) => {
        chassisRef.current!.position.set(x, y, z)
      })
      chassisApi.quaternion.subscribe(([x, y, z, w]) => {
        chassisRef.current!.quaternion.set(x, y, z, w)
      })
    }

    const { backward, brake, forward, left, reset, right } = controls.current

    for (let e = 2; e < 4; e++) {
      vehicleApi.applyEngineForce(forward || backward ? force * (forward && !backward ? -1 : 1) : 0, e)
    }

    for (let s = 0; s < 2; s++) {
      vehicleApi.setSteeringValue(left || right ? steer * (left && !right ? 1 : -1) : 0, s)
    }

    for (let b = 2; b < 4; b++) {
      vehicleApi.setBrake(brake ? maxBrake : 0, b)
    }

    if (reset) {
      chassisApi.position.set(...position)
      chassisApi.velocity.set(0, 0, 0)
      chassisApi.angularVelocity.set(...angularVelocity)
      chassisApi.rotation.set(...rotation)
    }

  })

  return (
    <group ref={vehicleRef}>
      <Chassis ref={chassisRef}>
        <ToggledAccelerateAudio />
        <BoostAudio />
        <BrakeAudio />
        <ToggledEngineAudio />
        <HonkAudio />
        <Boost />
        {children}
      </Chassis>
      <Wheel ref={wheels[0]} radius={radius} leftSide />
      <Wheel ref={wheels[1]} radius={radius} />
      <Wheel ref={wheels[2]} radius={radius} leftSide />
      <Wheel ref={wheels[3]} radius={radius} />
      <Dust />
      <Skid />
    </group>
  )
}

export default Vehicle