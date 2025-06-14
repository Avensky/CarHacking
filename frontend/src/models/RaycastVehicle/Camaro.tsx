// Camaro.tsx
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { GroupProps, useFrame, useThree } from '@react-three/fiber';
import { Camera, Controls, getState, PhysicsData } from '../../store';
import { lerp } from 'three/src/math/MathUtils';
import { setupVehicleParts } from '../../utils/setupVehicleParts';

let physicsData: PhysicsData
let camera: Camera
let editor: boolean
let controls: Controls

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
                    name: 'FRONT_LEFT_WHEEL',
                    parts: ['FL_TIRE', 'FL_RIM', 'FL_ROTOR'],
                },
                {
                    name: 'FRONT_RIGHT_WHEEL',
                    parts: ['FR_TIRE', 'FR_RIM', 'FR_ROTOR'],
                },
                {
                    name: 'REAR_LEFT_WHEEL',
                    parts: ['RL_TIRE', 'RL_RIM', 'RL_ROTOR'],
                },
                {
                    name: 'REAR_RIGHT_WHEEL',
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

    {/* <Dust /> */ }
    {/* <Skid /> */ }
    return (
        <group ref={vehicleGroupRef}>
            {Object.values(renderedGroups)}
            {children}
        </group>
    );
})

