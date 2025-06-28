import { createRef } from 'react'
import create from 'zustand'
import shallow from 'zustand/shallow'
import type { RefObject } from 'react'
import type { PublicApi, WheelInfoOptions } from '@react-three/cannon'
// import type { Session } from '@supabase/supabase-js'
import type { Group } from 'three'
import type { GetState, SetState, StateSelector } from 'zustand'
import { keys } from './keys'
import { Vec3 } from 'cannon-es'
import socket from './socket'

// speed
export const angularVelocity = [0, 0.5, 0] as const
export const cameras = ['GALLERY', 'DEFAULT', 'FIRST_PERSON', 'BIRD_EYE'] as const

export const dpr = 1.5 as const
export const levelLayer = 1 as const
export const maxBoost = 100 as const
// position: vehicle starting zone [x, y, z]
export const position = [-200, 0.75, -45] as const
// rotate plane horizontal
export const rotation = [0, Math.PI / 2, 0] as const
// import socket from './socket'

type Screen = 'selection-screen' | 'game-screen';

export type VehicleConfig = {
  wheelCount: number,
  radius: number,
  isTank: boolean,
  axleLocal: Vec3,
  compressionFactor: number,
  dampingRelaxation: number,       // resistance during compr:ssion
  dampingCompression: number,       // resistance on r:bound
  directionLocal: Vec3,

  frictionSlip: number,
  suspensionStiffness: number,
  suspensionRestLength: number,
  maxSuspensionForce: number,
  maxSuspensionTravel: number,
  rollInfluence: number,
  chassisConnectionPointLocal: Vec3,
  isFrontWheel: boolean,

  // vehicleConfig
  length: number,   // <- Match AE86 GLB
  width: number,    // <- Match AE86 GLB
  height: number,   // <- Match AE86 GLB
  chassisMass: number,
  indexRightAxis: number, // X
  indexUpAxis: number,   // Y
  indexForwardAxis: number, // Z
  wheelHalfTrackOffset: number, // Distance from center to side
  wheelBase: number, // Distance front to back
  fuelCapacity: number,          // Liters
  baseConsumption: number,   // Liters per tick per gear (baseline)

  // Options
  steer: number,
  maxSteer: number,
  maxBrake: number,
  maxSpeed: number,
  maxForce: number,
  maxBrakeForce: number,
  brakeLerpSpeed: number, // Smoothing factor
  angularVelocity: number[],
  maxBoost: number,
  cameras: string[],
  dpr: number,
  levelLayer: number,
  engineValue: number, // engine off

  gearRatios: number[], // gears 1–6
  shiftUpSpeeds: number[],// m/s
  shiftDownSpeeds: number[],
  finalDrive: number,
  idleRpm: number,
  maxRpm: number,
  shiftUpRpm: number,
  shiftDownRpm: number,
}


export type PhysicsData = {
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


// export type WheelInfo = Required<
//   Pick<
//     WheelInfoOptions,
//     | 'axleLocal'
//     | 'customSlidingRotationalSpeed'
//     | 'directionLocal'
//     | 'frictionSlip'
//     | 'radius'
//     | 'rollInfluence'
//     | 'sideAcceleration'
//     | 'suspensionRestLength'
//     | 'suspensionStiffness'
//     | 'useCustomSlidingRotationalSpeed'
//   >
// >

// export const wheelInfo: WheelInfo = {
//   axleLocal: [-1, 0, 0],
//   customSlidingRotationalSpeed: -0.01,
//   directionLocal: [0, -1, 0],
//   frictionSlip: 1.5,
//   radius: 0.38,
//   rollInfluence: 0,
//   sideAcceleration: 3,
//   suspensionRestLength: 0.35,
//   suspensionStiffness: 30,
//   useCustomSlidingRotationalSpeed: true,
// }


export const booleans = {
  binding: false,
  debug: false,
  editor: false,
  help: false,
  menu: false,
  cli: true,
  map: true,
  pickcolor: false,
  ready: false,
  shadows: true,
  stats: false,
  sound: true,
}

type Booleans = keyof typeof booleans

const exclusiveBooleans = ['help', 'menu', 'cli', 'pickcolor'] as const
type ExclusiveBoolean = (typeof exclusiveBooleans)[number]
const isExclusiveBoolean = (v: unknown): v is ExclusiveBoolean => exclusiveBooleans.includes(v as ExclusiveBoolean)

export type Camera = (typeof cameras)[number]

const controls = {
  backward: false,
  boost: false,
  brake: false,
  forward: false,
  honk: false,
  left: false,
  right: false,
  headlights: false,
  blinkerLeft: false,
  blinkerRight: false,
  hazards: false,
  reset: false,
  engineOn: false,
}
export type Controls = typeof controls
type Control = keyof Controls
export const isControl = (v: PropertyKey): v is Control => Object.hasOwnProperty.call(controls, v)

export type BindableActionName = Control | ExclusiveBoolean | Extract<Booleans,
  'editor' | 'map' | 'sound'> | 'camera' | 'reset' |
  'headlights' | 'blinkerLeft' | 'blinkerRight' | 'hazards'

export type ActionInputMap = Record<BindableActionName, string[]>
// toggle-style inputs
const toggledControls: Control[] = ['headlights', 'blinkerLeft', 'blinkerRight', 'hazards', 'engineOn']

const actionInputMap: ActionInputMap = {
  backward: ['arrowdown', 's'],
  boost: ['shift'],
  brake: [' '],
  camera: ['c'],
  editor: [','],
  forward: ['arrowup', 'w', 'z'],
  headlights: ['f'],
  help: ['i'],
  menu: ['escape'],
  honk: ['h'],
  cli: ['l'],
  left: ['arrowleft', 'a', 'q'],
  map: ['m'],
  pickcolor: ['p'],
  reset: ['r'],
  right: ['arrowright', 'd', 'e'],
  sound: ['u'],
  blinkerLeft: ['1'],
  blinkerRight: ['2'],
  hazards: ['3'],
  engineOn: ['4']

}

type Getter = GetState<IState>
export type Setter = SetState<IState>

type BaseState = Record<Booleans, boolean>

type BooleanActions = Record<Booleans, () => void>
type ControlActions = Record<Control, (v: boolean) => void>
type TimerActions = Record<'onCheckpoint' | 'onFinish' | 'onStart', () => void>

type Actions = BooleanActions &
  ControlActions &
  TimerActions & {
    camera: () => void
    reset: () => void
  }

export interface IState extends BaseState {
  [x: string]: any
  actions: Actions
  api: PublicApi | null
  bestCheckpoint: number
  camera: Camera
  // chassisBody: RefObject<Group>
  checkpoint: number
  color: string
  controls: Controls
  actionInputMap: ActionInputMap
  keyBindingsWithError: number[]
  dpr: number
  finished: number
  get: Getter
  level: RefObject<Group>
  // session: Session | null
  set: Setter
  start: number

  vehiclePosition?: { x: number; y: number; z: number }
  setVehiclePosition: (pos: { x: number; y: number; z: number }) => void
  // wheelInfo: WheelInfo
  wheels: [RefObject<Group>, RefObject<Group>, RefObject<Group>, RefObject<Group>]
  keyInput: string | null
}

const setExclusiveBoolean = (set: Setter, boolean: ExclusiveBoolean) => () =>
  set((state) => ({ ...exclusiveBooleans.reduce((o, key) => ({ ...o, [key]: key === boolean ? !state[boolean] : false }), state) }))

const useStoreImpl = create<IState>(
  (set: SetState<IState>, get: GetState<IState>) => {
    const toggleCooldowns: Record<string, number> = {}
    const controlActions = keys(controls).reduce<Record<Control, (value: boolean) => void>>((o, control) => {
      o[control] = (value: boolean) => {
        if (toggledControls.includes(control)) {
          if (value) {
            const now = Date.now()
            const lastToggle = toggleCooldowns[control] || 0

            if (now - lastToggle > 300) { // 300ms debounce
              toggleCooldowns[control] = now
              set((state) => ({
                controls: {
                  ...state.controls,
                  [control]: !state.controls[control],
                },
              }))
            }
          }
        } else {
          set((state) => ({
            controls: {
              ...state.controls,
              [control]: value,
            },
          }))
        }
      }
      return o
    }, {} as Record<Control, (value: boolean) => void>)
    const booleanActions = keys(booleans).reduce<Record<Booleans, () => void>>((o, boolean) => {
      o[boolean] = isExclusiveBoolean(boolean) ? setExclusiveBoolean(set, boolean) : () => set((state) => ({ ...state, [boolean]: !state[boolean] }))
      return o
    }, {} as Record<Booleans, () => void>)

    const actions: Actions = {
      ...booleanActions,
      ...controlActions,
      camera: () =>
        set((state) => {

          if (state.screen === "selection-screen") {
            return {}; // do nothing — stay in GALLERY
          }

          const currentIndex = cameras.indexOf(state.camera);
          let nextIndex = (currentIndex + 1) % cameras.length;
          let nextCamera = cameras[nextIndex];

          // If we're in game-screen, skip "GALLERY"
          if (state.screen === "game-screen") {
            while (nextCamera === "GALLERY") {
              nextIndex = (nextIndex + 1) % cameras.length;
              nextCamera = cameras[nextIndex];
            }
          }

          return { camera: nextCamera };
        }),
      onCheckpoint: () => {
        const { start } = get()
        if (start) {
          const checkpoint = Date.now() - start
          set({ checkpoint })
        }
      },
      onFinish: () => {
        const { finished, start } = get()
        if (start && !finished) {
          set({ finished: Math.max(Date.now() - start, 0) })
        }
      },
      onStart: () => {
        set({ finished: 0, start: Date.now() })
      },
      reset: () => {
        // 🧠 Persist in frontend store
        getState().setControls({
          reset: false,
          engineOn: false,
          // forward: false,
          // backward: false,
          // left: false,
          // right: false,
          // brake: false,
          // blinkerLeft: false,
          // blinkerRight: false,
          // hazards: false,
          // headlights: false,
        });
        // socket.emit('spawnPlayer', { vehicle, map });
        set({ menu: false });// 👈 set menu mode

        // socket.emit('controls', { reset: true, engineOn: false });
        // // Clear the reset flag on the next tick
        // setTimeout(() => {
        //   socket.emit('controls', { reset: false, engineOn: false });
        // }, 50);
      },
    }


    return {
      ...booleans,
      actionInputMap,
      actions,
      api: null,
      bestCheckpoint: 0,
      camera: cameras[0],
      // chassisBody: createRef<Group>(),
      checkpoint: 0,
      color: '#FFFF00',
      controls,
      keyBindingsWithError: [],
      dpr,
      finished: 0,
      get,
      keyInput: null,
      level: createRef<Group>(),
      rotatingCamera: {
        angle: 0,
      },
      setRotatingCamera: (data: Partial<{ angle: number }>) =>
        set((state) => ({
          rotatingCamera: { ...state.rotatingCamera, ...data },
        })),
      session: null,
      set,
      setControls: (partialControls: Controls) => set((state) => ({
        controls: { ...state.controls, ...partialControls }
      })),
      screen: 'selection-screen' as Screen,
      setScreen: (screen: Screen) => {
        set({ screen });
        if (screen === "selection-screen") {
          set({ camera: "GALLERY" });
          set({ engineOn: false })
        }
      },
      start: 0,
      physicsData: null,
      setPhysicsData: (data: { data: any }) => set({ physicsData: data }),
      vehiclePosition: undefined,
      setVehiclePosition: (pos) => set({ vehiclePosition: pos }),
      vehicleConfig: null,
      setVehicleConfig: (data: { data: any }) => set({ vehicleConfig: data }),
      // wheelInfo,
      wheels: [createRef<Group>(), createRef<Group>(), createRef<Group>(), createRef<Group>()],
    }
  })

interface Mutation {
  boost: number
  rpmTarget: number
  sliding: boolean
  speed: number
  fuel: number
  temp: number
  gearPosition: number
  velocity: [number, number, number]
}

export const mutation: Mutation = {
  // Everything in here is mutated to avoid even slight overhead
  boost: maxBoost,
  rpmTarget: 0,
  sliding: false,
  speed: 0,
  fuel: 100,
  temp: 195,
  gearPosition: 0,
  velocity: [0, 0, 0],
}

// Make the store shallow compare by default
const useStore = <T>(sel: StateSelector<IState, T>) => useStoreImpl(sel, shallow)

Object.assign(useStore, useStoreImpl)

const { getState, setState, subscribe } = useStoreImpl

export const isToggledControl = (c: string): c is Control =>
  toggledControls.includes(c as Control)

export { getState, setState, useStore, subscribe }
