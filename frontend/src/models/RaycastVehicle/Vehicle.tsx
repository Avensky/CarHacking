import type { BoxProps, WheelInfoOptions } from '@react-three/cannon'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group, Mesh } from 'three'
import type { PropsWithChildren } from 'react'

import { Chassis } from './Chassis'
import { useToggle } from '../../useToggle'
import { useControls } from './use-controls'
import { Wheel } from './Wheel'

import { AccelerateAudio, BoostAudio, Boost, BrakeAudio, Dust, EngineAudio, HonkAudio, Skid } from '../../effects'
import socket from '../../socket'

interface PhysicsData {
  wheelInfos: Array<{
    position: { x: number; y: number; z: number };
    quaternion: { x: number; y: number; z: number; w: number };
  }>;
  chassisBody: {
    position:THREE.Vector3
    angularVelocity:THREE.Vector3
    velocity:THREE.Vector3
    quaternion: { x: number; y: number; z: number; w: number };
  }
}

type VehicleProps = Required<PropsWithChildren<Pick<BoxProps, 'angularVelocity' | 'position' | 'rotation'>>> & {
// type VehicleProps = Required<PropsWithChildren> & {
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
}: VehicleProps) {
  
  const ToggledAccelerateAudio = useToggle(AccelerateAudio, ['ready', 'sound'])
  const ToggledEngineAudio = useToggle(EngineAudio, ['ready', 'sound'])
  const controls = useControls()
  
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      angularVelocity,
      args: [1.7, 1, 4],
      mass: 1500,
      onCollide: (e) => console.log('bonk', e.body.userData),
      position,
      rotation,
    }),
    useRef<Mesh>(null),
  )
      
  const wheels = [useRef<Group>(null), useRef<Group>(null), useRef<Group>(null), useRef<Group>(null)]
      
  // Create and configure the vehicle
  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
      wheels,
    }),
    useRef<Group>(null)
  );
   
  const wheelInfo: WheelInfoOptions = {
            axleLocal: [-1, 0, 0], // This is inverted for asymmetrical wheel models (left v. right sided)
            customSlidingRotationalSpeed: -30,
            dampingCompression: 4.4,
            dampingRelaxation: 10,
            directionLocal: [0, -1, 0], // set to same as Physics Gravity
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
  useEffect(() => vehicleApi.sliding.subscribe((v) => console.log('sliding', v)), [])
  // useEffect(() => vehicleApi.sliding.subscribe((v) => {}), [])

  // useEffect(() => {
  //   // Listen for physics updates from the server
  //   const onPhysicsUpdate = (data: PhysicsData) => {
  //     // Update vehicle properties with the data received from the server
  //     if (data.chassisBody) {
  //       // Update chassis position, velocity, and angular velocity
  //       const { position, velocity, angularVelocity, quaternion} = data.chassisBody;
        
  //       // Use API methods to update the vehicle's physics state
  //       chassisApi.position.set(position.x, position.y, position.z);
  //       chassisApi.velocity.set(velocity.x, velocity.y, velocity.z);
  //       chassisApi.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
  //       chassisApi.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  //     }
  //     // If necessary, update wheels or other vehicle parts here
  //     if (data.wheelInfos) {
        
  //       // console.log(data.wheelInfos);
  //       data.wheelInfos.forEach((wheel, index) => {
  //        if (wheels[index].current) {
  //          wheels[index].current.position.set(
  //            wheel.position.x, 
  //            wheel.position.y, 
  //            wheel.position.z
  //          );
  //          wheels[index].current.quaternion.set(
  //            wheel.quaternion.x,
  //            wheel.quaternion.y,
  //            wheel.quaternion.z,
  //            wheel.quaternion.w
  //          );
  //        }
  //       });
  //     }
  //   };

  //   socket.on('physicsUpdate', onPhysicsUpdate);
  //   return () => {
  //     socket.off('physicsUpdate', onPhysicsUpdate);
  //   };
  // }, [chassisApi]);

  useFrame(() => {
    const { backward, brake, forward, left, reset, right } = controls.current
    
    for (let e = 2; e < 4; e++) {
      vehicleApi.applyEngineForce(forward || backward ? force * (forward && !backward ? -1 : 1) : 0, 2)
    }
    
    for (let s = 0; s < 2; s++) {
      vehicleApi.setSteeringValue(left || right ? steer * (left && !right ? 1 : -1) : 0, s)
    }

    for (let b = 2; b < 4; b++) {
      // socket.emit('keydown', {key:"brake"})
      vehicleApi.setBrake(brake ? maxBrake : 0, b)
    }

    if (reset) {
      chassisApi.position.set(...position)
      chassisApi.velocity.set(0, 0, 0)
      chassisApi.angularVelocity.set(...angularVelocity)
      chassisApi.rotation.set(...rotation)
    }
  })

  return (<group ref={vehicle} // position={[0, -0.4, 0]}
          >
          <Chassis 
            ref={chassisBody} 
          >
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
