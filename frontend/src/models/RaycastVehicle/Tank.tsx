// Packages
import { forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Vector3, Group, SpotLightHelper, Color } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'lodash-es'
import { SpotLight } from 'three'
import { useHelper } from '@react-three/drei'
import { AccelerateAudio, BoostAudio, Boost, BrakeAudio, Dust, EngineAudio, HonkAudio, Skid } from '../../effects'
import type { PropsWithChildren } from 'react'
import { BoxProps } from '@react-three/cannon'
import { useToggle } from '../../useToggle'
import { lerp } from 'three/src/math/MathUtils'
import {
    getState, useStore, type Camera, type Controls //. type WheelInfo 
} from '../../store'

// Define type of data used - Typescript requirement
type VehicleProps = PropsWithChildren<Pick<BoxProps, 'angularVelocity' | 'position' | 'rotation'>>
interface PhysicsData {
    chassisBody: {
        position: { x: number; y: number; z: number }
        quaternion: { x: number; y: number; z: number; w: number }
    }
    data: {
        speed: number
        steeringValue: number

    }
    wheelInfos: Array<{
        position: { x: number; y: number; z: number }
        quaternion: { x: number; y: number; z: number; w: number }
    }>
}
let camera: Camera
let editor: boolean
let controls: Controls

// In Vehicle.tsx
export default forwardRef(function Tank({ children }: VehicleProps, ref: React.Ref<Group>) {
    const group = useRef<Group>();
    const { scene } = useGLTF('/models/cars/tank.glb');
    useImperativeHandle(ref, () => vehicleGroupRef.current, [])
    const defaultCamera = useThree((state) => state.camera)

    // Ref's are used for movements
    const vehicleGroupRef = useRef<Group>(null!)

    // Extract key parts by name or node hierarchy
    // const turret = scene.getObjectByName('Object_15'); // Example name, adjust as needed
    // const cannon = scene.getObjectByName('Object_14');
    // const tracks = scene.getObjectByName('Object_23');
    // const chassis = scene.getObjectByName('Object_17');
    useEffect(() => {
        const parts = [
            // 'Object_2',
            // 'Object_3',
            // 'Object_4',
            // 'Object_5',
            // 'Object_6',
            // 'Object_7',
            // 'Object_8',
            // 'Object_9',
            // 'Object_10',
            // 'Object_11',
            // 'Object_12',
            // 'Object_13',
            'Object_14', // cannon
            'Object_15', // turret
            // 'Object_16',
            'Object_17', // chassis
            // 'Object_18',
            // 'Object_19',
            // 'Object_20',
            // 'Object_21',
            // 'Object_22',
            'Object_23', // tracks
            // 'Object_24',
            // 'Object_25',
            // 'Object_26',
        ]

        parts.forEach(name => {
            const original = scene.getObjectByName(name)
            if (original) {
                const cloned = original.clone(true)
                vehicleGroupRef.current.add(cloned)
            }
        })

    }, [scene])

    const wheels = useMemo(() => {
        const names = ['Object_4', 'Object_5', 'Object_6', 'Object_7', 'Object_8', 'Object_9'] // <- update if needed
        return names.map(name => {
            const original = scene.getObjectByName(name)
            return original ? clone(original) : null
        })
    }, [scene])

    const physics = useStore((s) => s.physicsData?.data)
    const v = new Vector3()

    // useImperativeHandle(ref, () => carGroupRef.current, [])
    // const defaultCamera = useThree((state) => state.camera)
    const [physicsData, setPhysicsData] = useState<PhysicsData | null>(null)

    // Update transformations every frame ie. chassis
    useFrame((_, delta) => {
        if (!physicsData || !group.current) return
        camera = getState().camera
        editor = getState().editor
        controls = getState().controls
        if (!editor) {
            if (camera === 'FIRST_PERSON') {
                v.set(0.3, 1, .08)
                // v.set(0.3 + (Math.sin(-steeringValue) * physicsData.data.speed) / 30, 1, -0.08)
            } else if (camera === 'DEFAULT') {
                v.set(0, 3, 6)
                // v.set((Math.sin(steeringValue) * speed) / 2.5, 2.0 + (engineValue / 1000) * -0.5, 5 - speed / 15 + (controls.brake ? 1 : 0))
            }
            // moves camera to user
            defaultCamera.position.lerp(v, delta)
            defaultCamera.rotation.z = lerp(
                defaultCamera.rotation.z,
                (camera !== 'BIRD_EYE' ? 0 : Math.PI / 2)
                + (-physicsData.data.steeringValue * physicsData.data.speed) / (camera === 'DEFAULT' ? 30 : 55),
                delta,
            )
        }
    });

    // console.log(scene)
    const ToggledAccelerateAudio = useToggle(AccelerateAudio, ['ready', 'sound'])
    const ToggledEngineAudio = useToggle(EngineAudio, ['ready', 'sound'])

    // useLayoutEffect(() => api.sliding.subscribe((sliding) => (mutation.sliding = sliding)), [api])
    return (
        <>
            {/* Vehicle */}
            <group ref={vehicleGroupRef} dispose={null} scale={0.5} position={[0, -0.5, 0]} >
                {children}
            </group>
            {/* <axesHelper args={[0.5]} /> */}
            {/* Wheels */}
            {wheels.map((wheel, i) =>
                wheel ? <primitive key={i} object={wheel} /> : null
            )}
            {/* <Dust /> */}
            {/* <Skid /> */}
        </>
    )
})

useGLTF.preload('/models/cars/tank.glb');