// Camaro.tsx
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { GroupProps, useFrame, useThree } from '@react-three/fiber';
import { Camera, Controls, getState, PhysicsData } from '../../store';
import { lerp } from 'three/src/math/MathUtils';
import { setupVehicleParts } from '../../utils/setupVehicleParts';

export default forwardRef(function Camaro({ children, ...props }: GroupProps, ref: React.Ref<Group>) {
    const { scene } = useGLTF('/models/cars/camaro2017.glb');
    useImperativeHandle(ref, () => vehicleGroupRef.current, [])
    // const defaultCamera = useThree((state) => state.camera)
    // const v = new Vector3()

    const vehicleGroupRef = useRef<Group>(null!)
    const { clonesByGroup, renderedGroups } = useMemo(() => {

        return setupVehicleParts({
            scene,
            groups: [
                {
                    name: 'BODY',
                    parts: [
                        'SUNROOF', 'FRONT_windows',
                        'REAR_WINDOW',
                        'RIGHT_QUARTER_WINDOW', 'LEFT_QUARTER_WINDOW',
                        'HEADLIGHT_LENS_LEFT', 'HEADLIGHT_LENS_RIGHT',
                        'TAILLIGHT_LENS_LEFT', 'TAILLIGHT_LENS_RIGHT',
                        'BODY', 'REARVIEW_MIRROR', 'GRILL', 'GRILL_2',
                        'CHASSIS', 'FRONT_BUMPER', 'FRONT_BUMPER_2',
                        'HEADLIGHTS', 'HEADLIGHTS_OFFSET', 'BODY_badges',
                        'BODY_DOOR_FRAMES', 'REAR_BRAKES_LEFT', 'REAR_BRAKES_RIGHT',
                        'REAR_CAB', 'REARBUMPER_badges', 'REARBUMPER',
                        'REARBUMPER_2', 'REARBUMPER_lights', 'REARBUMPER_LIP',
                        'FL_BRAKE_CALIPER', 'FR_BRAKE_CALIPER', 'RL_BRAKE_CALIPER',
                        'RR_BRAKE_CALIPER', 'INTERIOR', 'INTERIOR_2',
                        'SEATS', 'SEATS_2', 'SEATS_3', 'FRONT_CADDY',
                        'DASHBOARD', 'DASHBOARD_2', 'NEEDLE_RPM', 'NEEDLE_SPEED',
                        'MUFFLERS', 'EMPTY'
                    ],
                    transparent: [
                        'SUNROOF_window', 'FRONT_windows',
                        'RIGHT_QUARTER_WINDOW', 'LEFT_QUARTER_WINDOW',
                        'HEADLIGHT_LENS_LEFT', 'HEADLIGHT_LENS_RIGHT',
                        'TAILLIGHT_LENS_LEFT', 'TAILLIGHT_LENS_RIGHT',
                        'REAR_WINDOW',
                    ],
                    opacity: 0.4,
                },
                {
                    name: 'HOOD',
                    parts: [
                        'HOOD_VENT', 'HOOD', 'HOOD_2', 'HOOD_3'
                    ],
                },
                {
                    name: 'TRUNK',
                    parts: [
                        'TRUNK', 'TRUNK_WING', 'CENTER_BREAK_LIGHT',
                        'CHEVY_EMBLEM', 'REAR_BRAKES_BOOT'
                    ],

                },
                {
                    name: 'DOOR_LEFT',
                    parts: [
                        'DOOR_LEFT_LED', 'DOOR_LEFT', 'DOOR_LEFT_2',
                        'DOOR_LEFT_3', 'DOOR_LEFT_4', 'DOOR_LEFT_5',
                        'DOOR_LEFT_6', 'DOOR_LEFT_7', 'MIRROR_LEFT_GLASS',
                        'MIRROR_LEFT', 'MIRROR_LEFT_2', 'MIRROR_LEFT_3',
                        'LEFT_WINDOW',
                    ],
                    transparent: ['LEFT_WINDOW', 'MIRROR_LEFT_GLASS'],
                    opacity: 0.1,
                },
                {
                    name: 'DOOR_RIGHT',
                    parts: [
                        'DOOR_RIGHT_LED', 'DOOR_RIGHT', 'DOOR_RIGHT_2',
                        'DOOR_RIGHT_3', 'DOOR_RIGHT_4', 'DOOR_RIGHT_5',
                        'DOOR_RIGHT_6', 'DOOR_RIGHT_7', 'MIRROR_RIGHT',
                        'MIRROR_RIGHT_2', 'MIRROR_RIGHT_3', 'MIRROR_RIGHT_GLASS',
                        'RIGHT_WINDOWS',
                    ],
                    transparent: ['MIRROR_RIGHT_GLASS', 'RIGHT_WINDOWS'],
                    opacity: 0.1,
                },
                {
                    name: 'FL_WHEEL',
                    parts: ['FL_TIRE', 'FL_RIM', 'FL_ROTOR'],
                },
                {
                    name: 'FR_WHEEL',
                    parts: ['FR_TIRE', 'FR_RIM', 'FR_ROTOR'],
                },
                {
                    name: 'RL_WHEEL',
                    parts: ['RL_TIRE', 'RL_RIM', 'RL_ROTOR'],
                },
                {
                    name: 'RR_WHEEL',
                    parts: ['RR_TIRE', 'RR_RIM', 'RR_ROTOR'],
                },
                {
                    name: 'STEERING_WHEEL',
                    parts: [
                        'STEERING_WHEEL_CENTER', 'STEERING_WHEEL_SIDES',
                        'STEERING_WHEEL_INSIDE', 'STEERING_WHEEL_BOTTOM',],
                },
            ]
        })
    }, [scene])

    const defaultCamera = useThree((state) => state.camera)
    const v = new Vector3()
    const wheelRefs = useMemo(() => {
        return [
            clonesByGroup['FL_WHEEL'],
            clonesByGroup['FR_WHEEL'],
            clonesByGroup['RL_WHEEL'],
            clonesByGroup['RR_WHEEL'],
        ].map((group) => {
            // Each group might contain multiple meshes, but we'll treat the group itself as a container
            const groupObj = new Group();
            Object.values(group).forEach((obj) => {
                groupObj.add(obj);
            });
            return groupObj;
        });
    }, [clonesByGroup]);


    useFrame((_, delta) => {
        const store = getState()
        const camMode = store.camera
        const isEditor = store.editor
        const physicsData = store.physicsData

        if (!physicsData) return // ✅ Add this line
        const { speed, engineValue, steeringValue, controls } = physicsData.data

        if (!physicsData) return

        // console.log('engaging physicsData')
        const { chassisBody, wheelInfos } = physicsData
        const group = vehicleGroupRef.current

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
            if (!wheelRefs[i]) return
            wheelRefs[i].position.lerpVectors(
                wheelRefs[i].position,
                new Vector3(
                    wheel.position.x,
                    wheel.position.y, // <-- lower slightly
                    wheel.position.z
                ),
                .5 // ← smoothing factor
            )
            wheelRefs[i].quaternion.set(
                wheel.quaternion.x,
                wheel.quaternion.y,
                wheel.quaternion.z,
                wheel.quaternion.w
            )
        })

        if (!isEditor) {
            if (camMode === 'FIRST_PERSON') {
                v.set(-0.2, 0.99, -.15)
                // v.set(0.3 + (Math.sin(-steeringValue) * physicsData.data.speed) / 30, 1, -0.08)
            } else if (camMode === 'DEFAULT') {
                v.set(0, 3, 6)
                // v.set((Math.sin(steeringValue) * speed) / 2.5, 2.0 + (engineValue / 1000) * -0.5, 5 - speed / 15 + (controls.brake ? 1 : 0))
            }

            // moves camera to user
            defaultCamera.position.lerp(v, delta)
            defaultCamera.rotation.z = lerp(
                defaultCamera.rotation.z,
                (camMode !== 'BIRD_EYE' ? 0 : Math.PI / 2)
                + (-steeringValue * speed) / (camMode === 'DEFAULT' ? 10 : 35),
                delta
            )
        }
    })

    {/* <Dust /> */ }
    {/* <Skid /> */ }
    return (
        <group ref={vehicleGroupRef}>
            {Object.values(renderedGroups)}
            {children}
            {wheelRefs.map((wheel, i) => (
                <primitive key={`wheel-${i}`} object={wheel} />
            ))}
        </group>
    );
})
