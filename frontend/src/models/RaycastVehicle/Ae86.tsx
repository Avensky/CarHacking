// Packages
import { forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Vector3, Group, SpotLightHelper, Color, DirectionalLight } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'lodash-es'
import { SpotLight } from 'three'
import { useHelper } from '@react-three/drei'
import { AccelerateAudio, BoostAudio, Boost, BrakeAudio, Dust, EngineAudio, HonkAudio, Skid, Cameras } from '../../effects'
import { useToggle } from '../../useToggle'
import { lerp } from 'three/src/math/MathUtils'
import {
    getState, PhysicsData, useStore, type Camera, type Controls //. type WheelInfo 
} from '../../store'

// In Vehicle.tsx
export default forwardRef(function Ae86({ playerId, children }: { playerId: string, children: any }, ref: React.Ref<Group>) {

    // multiplayer support
    // const vehicleId = useStore(state => state.vehicleId); // or prop/socket
    // const isLocalPlayer = playerId === vehicleId;
    const v = new Vector3()
    const camera = useThree((s) => s.camera)
    const carGroupRef = useRef<Group>(null!)

    // Simulate hazard lights
    const blinkTimer = useRef(0)
    const blinkState = useRef(false)

    // Ref's are used for movements    
    const leftLightRef = useRef<any>(null!)
    const rightLightRef = useRef<any>(null!)
    const leftTailRef = useRef<any>(null!)
    const rightTailRef = useRef<any>(null!)
    const flBlinkerRef = useRef<any>(null!)
    const frBlinkerRef = useRef<any>(null!)
    const rlBlinkerRef = useRef<any>(null!)
    const rrBlinkerRef = useRef<any>(null!)

    useImperativeHandle(ref, () => carGroupRef.current, [])
    const defaultCamera = useThree((state) => state.camera)


    const { scene } = useGLTF('/models/cars/ae86Rotated.glb')
    const [headlightsOn, setHeadlightsOn] = useState(false);
    const [leftBlinker, setLeftBlinker] = useState(false);
    const [rightBlinker, setRightBlinker] = useState(false);
    const [hazards, setHazards] = useState(false);
    // console.log('PhysicsData', physicsData);
    // console.log('controlsData', controls);
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
        leftLightRef.current = new SpotLight(0xffffff, 5, 40, Math.PI / 6, 0.2)
        const leftLight = leftLightRef.current
        leftLight.position.set(-.5, 0.7, -1.8) // relative to headlight mesh center
        leftLight.target.position.set(-0.4, -0.6, -5)
        leftLight.target.updateMatrixWorld()
        leftLight.visible = headlightsOn
        carGroupRef.current.add(leftLight)
        carGroupRef.current.add(leftLight.target)

        // Create right headlight
        rightLightRef.current = new SpotLight(0xffffff, 5, 40, Math.PI / 6, 0.2)
        const rightLight = rightLightRef.current
        rightLight.position.set(.55, 0.7, -1.8)
        rightLight.target.position.set(0.4, -0.6, -5)
        rightLight.target.updateMatrixWorld()
        rightLight.visible = headlightsOn
        carGroupRef.current.add(rightLight)
        carGroupRef.current.add(rightLight.target)

        // Left tail light
        leftTailRef.current = new SpotLight(0xff0000, 3, 8, Math.PI / 4, 0.2)
        const leftTail = leftTailRef.current
        leftTail.position.set(-0.5, 0.6, 1.9) // Rear of the car (x,y,z)
        leftTail.target.position.set(-0.5, 0.5, 3)
        leftTail.target.updateMatrixWorld()
        leftTail.visible = false
        carGroupRef.current.add(leftTail)
        carGroupRef.current.add(leftTail.target)

        // Front Right tail light
        rightTailRef.current = new SpotLight(0xff0000, 3, 8, Math.PI / 4, 0.2)
        const rightTail = rightTailRef.current
        rightTail.position.set(0.57, 0.6, 1.8)
        rightTail.target.position.set(0.57, 0.5, 3)
        rightTail.target.updateMatrixWorld()
        rightTail.visible = false
        carGroupRef.current.add(rightTail)
        carGroupRef.current.add(rightTail.target)

        // front Left blinker (orange)
        flBlinkerRef.current = new SpotLight(0xffa500, 12, 16, Math.PI / 8, 0.2)
        const frontLeftBlinker = flBlinkerRef.current
        frontLeftBlinker.position.set(-0.7, 0.6, -1.9)
        frontLeftBlinker.target.position.set(-0.85, 0.6, -3)
        frontLeftBlinker.visible = leftBlinker || hazards
        frontLeftBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(frontLeftBlinker)
        carGroupRef.current.add(frontLeftBlinker.target)

        // front Right blinker (orange)
        frBlinkerRef.current = new SpotLight(0xffa500, 12, 16, Math.PI / 8, 0.2)
        const frontRightBlinker = frBlinkerRef.current
        frontRightBlinker.position.set(0.7, 0.6, -1.9)
        frontRightBlinker.target.position.set(0.9, 0.6, -3)
        frontRightBlinker.visible = rightBlinker || hazards
        frontRightBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(frontRightBlinker)
        carGroupRef.current.add(frontRightBlinker.target)

        // rear Left blinker (orange)
        rlBlinkerRef.current = new SpotLight(0xffa500, 12, 16, Math.PI / 8, 0.2)
        const rearLeftBlinker = rlBlinkerRef.current
        rearLeftBlinker.position.set(-0.5, 0.6, 1.9)
        rearLeftBlinker.target.position.set(-0.9, 0.6, 3)
        rearLeftBlinker.visible = leftBlinker || hazards
        rearLeftBlinker.target.updateMatrixWorld()
        carGroupRef.current.add(rearLeftBlinker)
        carGroupRef.current.add(rearLeftBlinker.target)

        // rear Right blinker (orange)
        rrBlinkerRef.current = new SpotLight(0xffa500, 12, 18, Math.PI / 8, 0.2)
        const rearRightBlinker = rrBlinkerRef.current
        rearRightBlinker.position.set(0.5, 0.6, 1.9)
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

    // Update transformations every frame ie. chassis
    useFrame((_, delta) => {
        // get state on frame
        const store = getState()
        const controls = store.controls
        const physicsData = store.physicsData
        const camMode = store.camera
        const isEditor = store.editor

        // Update blink state every 0.5s
        blinkTimer.current += delta
        if (blinkTimer.current >= 0.5) {
            blinkTimer.current = 0
            blinkState.current = !blinkState.current
        }

        // Lights visibility
        if (leftLightRef.current) leftLightRef.current.visible = controls.headlights
        if (rightLightRef.current) rightLightRef.current.visible = controls.headlights

        if (leftTailRef.current) leftTailRef.current.visible = controls.brake
        if (rightTailRef.current) rightTailRef.current.visible = controls.brake

        const hazards = controls.hazards
        const blinkerLeft = controls.blinkerLeft
        const blinkerRight = controls.blinkerRight && !hazards
        const blinkOn = blinkState.current

        //headlights
        leftLightRef.current.visible = controls.headlights
        rightLightRef.current.visible = controls.headlights

        //taillights
        leftTailRef.current.visible = controls.brake
        rightTailRef.current.visible = controls.brake

        if (flBlinkerRef.current) flBlinkerRef.current.visible = (hazards || blinkerLeft) && blinkOn
        if (frBlinkerRef.current) frBlinkerRef.current.visible = (hazards || blinkerRight) && blinkOn
        if (rlBlinkerRef.current) rlBlinkerRef.current.visible = (hazards || blinkerLeft) && blinkOn
        if (rrBlinkerRef.current) rrBlinkerRef.current.visible = (hazards || blinkerRight) && blinkOn

        if (!physicsData) return

        // console.log('engaging physicsData')
        const { chassisBody, wheelInfos } = physicsData
        const group = carGroupRef.current

        // Update vehicle body
        group.position.lerpVectors(
            group.position,
            new Vector3(
                chassisBody.position.x,
                chassisBody.position.y - .55,
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
        wheelInfos.forEach((wheel: any, i: number) => {
            if (!wheels[i]) return
            wheels[i].position.lerpVectors(
                wheels[i].position,
                new Vector3(
                    wheel.position.x,
                    wheel.position.y, // <-- lower slightly
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

        if (!isEditor) {
            if (camMode === 'FIRST_PERSON') {
                v.set(0.3, 1.06, .01)
                // v.set(0.3 + (Math.sin(-steeringValue) * physicsData.data.speed) / 30, 1, -0.08)
            } else if (camMode === 'DEFAULT') {
                v.set(0, 3, 6)
                // v.set((Math.sin(steeringValue) * speed) / 2.5, 2.0 + (engineValue / 1000) * -0.5, 5 - speed / 15 + (controls.brake ? 1 : 0))
            }

            // moves camera to user
            defaultCamera.position.lerp(v, delta)
            // defaultCamera.rotation.z = lerp(
            //     // defaultCamera.position.lerp(v, delta)
            //     // defaultCamera.rotation.z = lerp(
            //     defaultCamera.rotation.z,
            //     (camMode !== 'BIRD_EYE' ? 0 : Math.PI / 2)
            //     + (-physicsData.data.steeringValue * physicsData.data.speed) / (camMode === 'DEFAULT' ? 30 : 55),
            //     delta,
            // )
        }

    })

    // Headlights
    useHelper(leftLightRef, SpotLightHelper, 'white')
    useHelper(rightLightRef, SpotLightHelper, 'white')
    // Tail lights
    useHelper(leftTailRef, SpotLightHelper, 'red')
    useHelper(rightTailRef, SpotLightHelper, 'red')
    //Left Blinkers
    useHelper(flBlinkerRef, SpotLightHelper, 'orange')
    useHelper(rlBlinkerRef, SpotLightHelper, 'orange')
    // Right Blinkers
    useHelper(frBlinkerRef, SpotLightHelper, 'orange')
    useHelper(rrBlinkerRef, SpotLightHelper, 'orange')

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