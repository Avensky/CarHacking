import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector3, Group, SpotLightHelper, Color } from 'three'
import { useFrame } from '@react-three/fiber'
import socket from '../../socket'
import { useControls } from './use-controls'
import { useGLTF } from '@react-three/drei'
import { clone } from 'lodash-es'
import { SpotLight } from 'three'
import { useHelper } from '@react-three/drei'

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
  const leftLightRef = useRef<SpotLight>(null!)
  const rightLightRef = useRef<SpotLight>(null!)

  // const controls = useControls({
  //   stiffness: { value: 60, min: 10, max: 200 },
  //   damping: { value: 5, min: 1, max: 10 },
  //   restLength: { value: 0.18, min: 0.1, max: 0.4 }
  // })

  const { scene } = useGLTF('/models/cars/ae86Rotated.glb')
  const controls = useControls() // this activates controls
  const [physicsData, setPhysicsData] = useState<PhysicsData | null>(null)
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const headlightBase = scene.getObjectByName('Headlights')


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

    // carGroupRef.current.traverse(obj => {
    //   if (obj.isMesh) {
    //     obj.material.emissive = new Color('white')
    //     obj.material.emissiveIntensity = 2
    //   }
    // })

    // Create left headlight
    leftLightRef.current = new SpotLight(0xffffff, 3, 20, Math.PI / 6, 0.2)
    const leftLight = leftLightRef.current
    leftLight.position.set(-.5, 0.7, -1.8) // relative to headlight mesh center
    leftLight.target.position.set(-0.4, 0.1, -5)
    leftLight.target.updateMatrixWorld()
    leftLight.visible = headlightsOn
    carGroupRef.current.add(leftLight)
    carGroupRef.current.add(leftLight.target)

    // Create right headlight
    rightLightRef.current = new SpotLight(0xffffff, 3, 20, Math.PI / 6, 0.2)
    const rightLight = rightLightRef.current
    rightLight.position.set(.55, 0.7, -1.8)
    rightLight.target.position.set(0.4, 0.1, -5)
    rightLight.target.updateMatrixWorld()
    rightLight.visible = headlightsOn
    carGroupRef.current.add(rightLight)
    carGroupRef.current.add(rightLight.target)
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
      0.2 // ← smoothing factor
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
      wheels[i].position.lerpVectors(
        wheels[i].position,
        new Vector3(
          wheel.position.x,
          wheel.position.y - .34, // <-- lower slightly
          wheel.position.z
        ),
        .2 // ← smoothing factor
      )

      wheels[i].quaternion.set(
        wheel.quaternion.x,
        wheel.quaternion.y,
        wheel.quaternion.z,
        wheel.quaternion.w
      )
    })
  })

  useHelper(leftLightRef, SpotLightHelper, 'white')
  useHelper(rightLightRef, SpotLightHelper, 'white')

  // console.log(scene)
  return (
    <>
      <group ref={carGroupRef} >
        <mesh position={[-.5, 0.7, -1.8]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial emissive={'white'} emissiveIntensity={2} />
        </mesh>
        <mesh position={[.55, 0.7, -1.8]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial emissive={'white'} emissiveIntensity={2} />
        </mesh>
      </group>
      {/* <axesHelper args={[0.5]} /> */}
      {wheels.map((wheel, i) =>
        wheel ? <primitive key={i} object={wheel} /> : null
      )}
    </>
  )

}