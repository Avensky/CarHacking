import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector3, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import socket from '../../socket'
import { useControls } from './use-controls'
import { useGLTF } from '@react-three/drei'
import { clone } from 'lodash-es'

interface PhysicsData {
  chassisBody: {
    position: { x: number; y: number; z: number }
    quaternion: { x: number; y: number; z: number; w: number }
  }
  wheelInfos: Array<{
    position: { x: number; y: number; z: number }
    quaternion: { x: number; y: number; z: number; w: number }
  }>
}

export default function Vehicle() {
  // const controls = useControls({
  //   stiffness: { value: 60, min: 10, max: 200 },
  //   damping: { value: 5, min: 1, max: 10 },
  //   restLength: { value: 0.18, min: 0.1, max: 0.4 }
  // })

  const { scene } = useGLTF('/models/cars/ae86Rotated.glb')
  const controls = useControls() // this activates controls
  const [physicsData, setPhysicsData] = useState<PhysicsData | null>(null)


  // But carGroup is a raw THREE.Group created in useMemo, and it does not get attached 
  // to the scene graph automatically via React. useMemo runs before React renders, and 
  // carGroup doesn't retain its own stateful reference or lifecycle hooks unless you 
  // treat it properly inside the render tree.
  // Create a chassis mesh
  const carGroupRef = useRef<Group>(null!)

  useEffect(() => {
    const parts = ['CarBody', 'Interior', 'SteeringWheel', 'Headlights', 'FL_Caliper', 'FR_Caliper', 'RL_Caliper', 'RR_Caliper']

    parts.forEach(name => {
      const original = scene.getObjectByName(name)
      if (original) {
        const cloned = original.clone(true)
        carGroupRef.current.add(cloned)
      }
    })


  }, [scene])



  const wheels = useMemo(() => {
    const names = ['FL_Wheel', 'FR_Wheel', 'RL_Wheel', 'RR_Wheel'] // <- update if needed
    return names.map(name => {
      const original = scene.getObjectByName(name)
      return original ? clone(original) : null
    })
  }, [scene])

  // Listen to physics updates from backend
  useEffect(() => {
    const handlePhysicsUpdate = (data: PhysicsData) => {
      setPhysicsData(data)
    }

    socket.on('physicsUpdate', handlePhysicsUpdate)
    return () => socket.off('physicsUpdate', handlePhysicsUpdate)
  }, [])

  // Update chassis and wheel transforms every frame
  useFrame(() => {
    if (!physicsData || !carGroupRef.current) return
    const { chassisBody, wheelInfos } = physicsData
    const group = carGroupRef.current

    // Update chassis
    group.position.lerpVectors(
      group.position,
      new Vector3(
        chassisBody.position.x,
        chassisBody.position.y - 0.77,
        chassisBody.position.z
      ),
      0.2
    )

    group.quaternion.set(
      chassisBody.quaternion.x,
      chassisBody.quaternion.y,
      chassisBody.quaternion.z,
      chassisBody.quaternion.w
    )

    // Update wheels
    wheelInfos.forEach((wheel, i) => {
      if (!wheels[i]) return
      wheels[i].position.set(
        wheel.position.x,
        wheel.position.y - .34, // <-- lower slightly
        wheel.position.z
      )
      wheels[i].quaternion.set(
        wheel.quaternion.x,
        wheel.quaternion.y,
        wheel.quaternion.z,
        wheel.quaternion.w
      )
    })
  })

  // console.log(scene)
  return (
    <>
      <group ref={carGroupRef} />
      {/* <axesHelper args={[0.5]} /> */}
      {wheels.map((wheel, i) =>
        wheel ? <primitive key={i} object={wheel} /> : null
      )}
    </>
  )

}