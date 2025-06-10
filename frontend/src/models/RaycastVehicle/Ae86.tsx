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
import socket from '../../socket'

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
export default forwardRef(function Ae86({ children }, ref: React.Ref<Group>) {
    const v = new Vector3()

    useImperativeHandle(ref, () => carGroupRef.current, [])
    const defaultCamera = useThree((state) => state.camera)

    // Ref's are used for movements
    const carGroupRef = useRef<Group>(null!)
    const leftLightRef = useRef<SpotLight>(null!)
    const rightLightRef = useRef<SpotLight>(null!)
    const leftTailLightRef = useRef<SpotLight>(null!)
    const rightTailLightRef = useRef<SpotLight>(null!)
    const frontLeftBlinkerRef = useRef<SpotLight>(null!)
    const frontRightBlinkerRef = useRef<SpotLight>(null!)
    const rearLeftBlinkerRef = useRef<SpotLight>(null!)
    const rearRightBlinkerRef = useRef<SpotLight>(null!)

    const { scene } = useGLTF('/models/cars/ae86Rotated.glb')

    const [physicsData, setPhysicsData] = useState<PhysicsData | null>(null)
    const [headlightsOn, setHeadlightsOn] = useState(false);
    const [leftBlinker, setLeftBlinker] = useState(false);
    const [rightBlinker, setRightBlinker] = useState(false);
    const [hazards, setHazards] = useState(false);

    useEffect(() => {
        const parts = ['CarBody', 'Interior', 'SteeringWheel', 'Headlights', 'FL_Caliper', 'FR_Caliper', 'RL_Caliper', 'RR_Caliper']

        parts.forEach(name => {
            const original = scene.getObjectByName(name)
            if (original) {
                const cloned = original.clone(true)
                carGroupRef.current.add(cloned)
            }
        })

        // Create left headlight
        leftLightRef.current = new SpotLight(0xffffff, 3, 20, Math.PI / 6, 0.2)
        const leftLight = leftLightRef.current
        leftLight.position.set(-.5, 0.7, -1.8) // relative to headlight mesh center
        leftLight.target.position.set(-0.4, -0.6, -5)
        leftLight.target.updateMatrixWorld()
        leftLight.visible = headlightsOn
        carGroupRef.current.add(leftLight)
        carGroupRef.current.add(leftLight.target)

        // Create right headlight
        rightLightRef.current = new SpotLight(0xffffff, 3, 20, Math.PI / 6, 0.2)
        const rightLight = rightLightRef.current
        rightLight.position.set(.55, 0.7, -1.8)
        rightLight.target.position.set(0.4, -0.6, -5)
        rightLight.target.updateMatrixWorld()
        rightLight.visible = headlightsOn
        carGroupRef.current.add(rightLight)
        carGroupRef.current.add(rightLight.target)

        // Left tail light
        leftTailLightRef.current = new SpotLight(0xff0000, 3, 8, Math.PI / 4, 0.2)
        const leftTail = leftTailLightRef.current
        leftTail.position.set(-0.5, 0.6, 1.9) // Rear of the car (x,y,z)
        leftTail.target.position.set(-0.5, 0.5, 3)
        leftTail.target.updateMatrixWorld()
        leftTail.visible = false
        carGroupRef.current.add(leftTail)
        carGroupRef.current.add(leftTail.target)

        // Front Right tail light
        rightTailLightRef.current = new SpotLight(0xff0000, 3, 8, Math.PI / 4, 0.2)
        const rightTail = rightTailLightRef.current
        rightTail.position.set(0.57, 0.6, 1.8)
        rightTail.target.position.set(0.57, 0.5, 3)
        rightTail.target.updateMatrixWorld()
        rightTail.visible = false
        carGroupRef.current.add(rightTail)
        carGroupRef.current.add(rightTail.target)

        // front Left blinker (orange)
        frontLeftBlinkerRef.current = new SpotLight(0xffa500, 2.5, 6, Math.PI / 4, 0.3)
        const frontLeftBlinker = frontLeftBlinkerRef.current
        frontLeftBlinker.position.set(-0.7, 0.6, -1.9)
        frontLeftBlinker.target.position.set(-0.85, 0.6, -3)
        frontLeftBlinker.visible = leftBlinker || hazards
        frontLeftBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(frontLeftBlinker)
        carGroupRef.current.add(frontLeftBlinker.target)

        // front Right blinker (orange)
        frontRightBlinkerRef.current = new SpotLight(0xffa500, 2.5, 6, Math.PI / 4, 0.3)
        const frontRightBlinker = frontRightBlinkerRef.current
        frontRightBlinker.position.set(0.7, 0.6, -1.9)
        frontRightBlinker.target.position.set(0.9, 0.6, -3)
        frontRightBlinker.visible = rightBlinker || hazards
        frontRightBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(frontRightBlinker)
        carGroupRef.current.add(frontRightBlinker.target)

        // rear Left blinker (orange)
        rearLeftBlinkerRef.current = new SpotLight(0xffa500, 3, 8, Math.PI / 6, 0.5)
        const rearLeftBlinker = rearLeftBlinkerRef.current
        rearLeftBlinker.position.set(-0.7, 0.6, 1.9)
        rearLeftBlinker.target.position.set(-0.85, 0.6, 3)
        rearLeftBlinker.visible = leftBlinker || hazards
        rearLeftBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(rearLeftBlinker)
        carGroupRef.current.add(rearLeftBlinker.target)

        // rear Right blinker (orange)
        rearRightBlinkerRef.current = new SpotLight(0xffa500, 2.5, 6, Math.PI / 6, 0.3)
        const rearRightBlinker = rearRightBlinkerRef.current
        rearRightBlinker.position.set(0.7, 0.6, 1.9)
        rearRightBlinker.target.position.set(0.9, 0.6, 3)
        rearRightBlinker.visible = rightBlinker || hazards
        rearRightBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(rearRightBlinker)
        carGroupRef.current.add(rearRightBlinker.target)

    }, [scene])

    const wheels = useMemo(() => {
        const names = ['FL_Wheel', 'FR_Wheel', 'RL_Wheel', 'RR_Wheel'] // <- update if needed
        return names.map(name => {
            const original = scene.getObjectByName(name)
            return original ? clone(original) : null
        })
    }, [scene])

    // Use these to simulate timing on hazard lights
    const blinkTimer = useRef(0)
    const blinkState = useRef(false)

    // Update transformations every frame ie. chassis
    useFrame((_, delta) => {
        if (!physicsData || !carGroupRef.current) return
        camera = getState().camera
        editor = getState().editor
        controls = getState().controls

        //headlights
        leftLightRef.current.visible = controls.headlights
        rightLightRef.current.visible = controls.headlights

        //taillights
        leftTailLightRef.current.visible = controls.brake
        rightTailLightRef.current.visible = controls.brake

        // blinking (every ~500ms)
        // Update blink timer (persisting across frames)
        blinkTimer.current += delta
        if (blinkTimer.current >= 0.5) {
            blinkTimer.current = 0
            blinkState.current = !blinkState.current
        }

        // Hazards override blinkers
        const hazards = controls.hazards

        const blinkerLeft = controls.blinkerLeft
        const blinkerRight = controls.blinkerRight && !hazards
        // console.log('blink left', blinkerLeft);
        // These should now flicker every ~0.5s
        frontLeftBlinkerRef.current.visible = (hazards || blinkerLeft) && blinkState.current
        frontRightBlinkerRef.current.visible = (hazards || blinkerRight) && blinkState.current
        rearLeftBlinkerRef.current.visible = (hazards || blinkerLeft) && blinkState.current
        rearRightBlinkerRef.current.visible = (hazards || blinkerRight) && blinkState.current
        // console.log(blinkerLeft)
        // console.log('Blink state:', blinkState.current)

        const { chassisBody, wheelInfos } = physicsData
        const group = carGroupRef.current

        // Update vehicle body
        group.position.lerpVectors(
            group.position,
            new Vector3(
                chassisBody.position.x,
                chassisBody.position.y - 0.77,
                chassisBody.position.z
            ),
            0.5 // ← smoothing factor
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
                .5 // ← smoothing factor
            )
            wheels[i].quaternion.set(
                wheel.quaternion.x,
                wheel.quaternion.y,
                wheel.quaternion.z,
                wheel.quaternion.w
            )
        })
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
    })

    // Headlights
    useHelper(leftLightRef, SpotLightHelper, 'white')
    useHelper(rightLightRef, SpotLightHelper, 'white')
    // Tail lights
    useHelper(leftTailLightRef, SpotLightHelper, 'red')
    useHelper(rightTailLightRef, SpotLightHelper, 'red')
    //Left Blinkers
    useHelper(frontLeftBlinkerRef, SpotLightHelper, 'orange')
    useHelper(rearLeftBlinkerRef, SpotLightHelper, 'orange')
    // Right Blinkers
    useHelper(frontRightBlinkerRef, SpotLightHelper, 'orange')
    useHelper(rearRightBlinkerRef, SpotLightHelper, 'orange')

    // console.log(scene)
    const ToggledAccelerateAudio = useToggle(AccelerateAudio, ['ready', 'sound'])
    const ToggledEngineAudio = useToggle(EngineAudio, ['ready', 'sound'])

    // useLayoutEffect(() => api.sliding.subscribe((sliding) => (mutation.sliding = sliding)), [api])
    return (
        <>
            {/* Vehicle */}
            <group ref={carGroupRef} >
                {/* <ToggledAccelerateAudio /> */}
                {/* <BoostAudio /> */}
                {/* <BrakeAudio /> */}
                {/* <ToggledEngineAudio /> */}
                {/* <HonkAudio /> */}
                {/* <Boost /> */}
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