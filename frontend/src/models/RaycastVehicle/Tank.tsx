// Packages
import { forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Vector3, Group, SpotLightHelper, Color } from 'three'
import { GroupProps, useFrame, useThree } from '@react-three/fiber'
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
export default forwardRef(function TankModel({ children, turretRotation = 0, cannonElevation = 0, ...props }: GroupProps & {
    turretRotation?: number;
    cannonElevation?: number;
}, ref: React.Ref<Group>) {
    const group = useRef<Group>();
    const { scene }: any = useGLTF('/models/cars/tank.glb');
    console.log(scene); // Check what's actually in the GLB

    useImperativeHandle(ref, () => vehicleGroupRef.current, [])
    const defaultCamera = useThree((state) => state.camera)

    // Ref's are used for movements
    const vehicleGroupRef = useRef<Group>(null!)


    // Extract key parts by name or node hierarchy
    useEffect(() => {
        const parts = [
            'Hull',
            'Breech',
            'Tracks',
            'CrewCompartment',
            'Interior_CrewCompartment',
            'Hatch_Front_Hatch_Hull'
            // 'Tank_Body_Non_Modular',
        ]

        parts.forEach(name => {
            const original = scene.getObjectByName(name)
            if (original) {
                const cloned = original.clone(true)
                vehicleGroupRef.current.add(cloned)
            }
        })
        console.log('scene children:', scene.children.map((c: { name: any }) => c.name));
    }, [scene])


    // rotation
    const turretRef = useRef<THREE.Group>(null)
    const cannonRef = useRef<THREE.Group>(null)
    const wheelsRef = useRef<THREE.Group>(null)


    const wheels = useMemo(() => {
        return [
            'Idlers',
            'DriveSprockets',
            'Roadwheel_L2_R2',
            'Roadwheel_L1_R1',
            'Roadwheel_L2_R2',
            'Roadwheel_L3',
            'Roadwheel_L4',
            'Roadwheel_L5',
            'Roadwheel_R3',
            'Roadwheel_R4',
            'Roadwheel_R5'
        ].map(name => scene.getObjectByName(name))
            .filter((obj): obj is THREE.Object3D => !!obj)
            .map(obj => obj.clone(true));
    }, [scene])

    {/* Turret with rotation */ }
    const turret = useMemo(() => {
        return [
            'Turret',
            'TurretBasket',
            'Interior_TurretBasket',
            'Hatch_Hull',
            'Hatch_Small',
            'Hatch_Small2',
        ].map(name => scene.getObjectByName(name))
            .filter((obj): obj is THREE.Object3D => !!obj)
            .map(obj => obj.clone(true));
    }, [scene])

    {/* Cannon with elevation */ }
    const cannon = useMemo(() => {
        return ['Cannon', 'Breech']
            .map(name => scene.getObjectByName(name))
            .filter((obj): obj is THREE.Object3D => !!obj)
            .map(obj => obj.clone(true));
    }, [scene]);

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
        <group scale={.7} >
            {/* Hull */}
            <group ref={vehicleGroupRef} dispose={null} position={[0, 0, 0]}>
                {children}
            </group>

            {/* Wheels */}

            <group ref={wheelsRef} rotation={[0, turretRotation, 0]}>
                {wheels
                    .filter((part): part is THREE.Object3D => !!part)
                    .map((part, i) => (
                        <primitive key={`cannon-${i}`} object={part} />
                    ))}
            </group>
            {/* Turret with rotation */}
            <group ref={turretRef} rotation={[0, turretRotation, 0]}>
                {turret
                    .filter((part): part is THREE.Object3D => !!part)
                    .map((part, i) => (
                        <primitive key={`cannon-${i}`} object={part} />
                    ))}

                {/* Cannon with elevation */}
                <group ref={cannonRef} rotation={[cannonElevation, 0, 0]}>
                    {cannon
                        .filter((part): part is THREE.Object3D => !!part)
                        .map((part, i) => (
                            <primitive key={`cannon-${i}`} object={part} />
                        ))}
                </group>

                {/* Remaining parts of turret like TurretBasket, etc. */}

            </group>
            {/* <Dust /> */}
            {/* <Skid /> */}
        </group>
    )
})

useGLTF.preload('/models/cars/tank.glb');