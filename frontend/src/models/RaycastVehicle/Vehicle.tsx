import { useEffect, useMemo, useState } from 'react'
import { Vector3, Quaternion, Mesh, BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'
import { useFrame } from '@react-three/fiber'
import socket from '../../socket'
import { useControls } from './use-controls'

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
  const controls = useControls()
  const [physicsData, setPhysicsData] = useState<PhysicsData | null>(null)

  // Create a chassis mesh
  const chassis = useMemo(() => {
    const geo = new BoxGeometry(1, .5, 2) // x, y, z size
    const mat = new MeshStandardMaterial({ color: 'red' })
    return new Mesh(geo, mat)
  }, [])

  // Create 4 wheel meshes (NO extra rotation here)
  const wheels = useMemo(() => {
    return new Array(4).fill(null).map(() => {
      const geo = new CylinderGeometry(0.3, 0.3, 0.15, 18) // radiusTop, radiusBottom, height
      const mat = new MeshStandardMaterial({ color: 'black' })
      geo.rotateZ(Math.PI / 2) // Rotate from Y-axis to X-axis
      return new Mesh(geo, mat)
    })
  }, [])

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
    if (!physicsData) return

    const { chassisBody, wheelInfos } = physicsData

    // Update chassis
    chassis.position.lerpVectors(
      chassis.position, new Vector3(
        chassisBody.position.x,
        chassisBody.position.y + 0.05,
        chassisBody.position.z
      ), 0.2)
    chassis.quaternion.set(
      chassisBody.quaternion.x,
      chassisBody.quaternion.y,
      chassisBody.quaternion.z,
      chassisBody.quaternion.w
    )

    // Update wheels
    wheelInfos.forEach((wheel, i) => {
      if (!wheels[i]) return
      wheels[i].position.set(wheel.position.x, wheel.position.y, wheel.position.z)
      wheels[i].quaternion.set(
        wheel.quaternion.x,
        wheel.quaternion.y,
        wheel.quaternion.z,
        wheel.quaternion.w
      )
    })
  })

  return (
    <>
      <primitive object={chassis} />
      {wheels.map((wheel, i) => (
        <primitive key={i} object={wheel} />
      ))}
    </>
  )
}
