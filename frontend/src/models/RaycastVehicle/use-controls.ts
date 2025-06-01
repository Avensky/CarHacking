import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import socket from '../../socket'

// 🔼 Move this section to the top BEFORE using GameControl
const keyControlMap = {
  ' ': 'brake',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'forward',
  a: 'left',
  d: 'right',
  r: 'reset',
  s: 'backward',
  w: 'forward',
} as const

type KeyCode = keyof typeof keyControlMap
type GameControl = typeof keyControlMap[KeyCode]

const keyCodes = Object.keys(keyControlMap) as KeyCode[]
const isKeyCode = (v: unknown): v is KeyCode => keyCodes.includes(v as KeyCode)

// ✅ Now use GameControl here
function useKeyControls(
  ref: MutableRefObject<Record<GameControl, boolean>>,
  map: Record<KeyCode, GameControl>,
) {
  useEffect(() => {
    console.log('🚀 useKeyControls initialized')
    const emitControls = () => {
      console.log('🛰 emitting:', ref.current)
      socket.emit('controls', { ...ref.current })
    }

    const handleKeydown = ({ key }: KeyboardEvent) => {
      if (!isKeyCode(key)) return
      ref.current[map[key]] = true
      emitControls()
    }

    const handleKeyup = ({ key }: KeyboardEvent) => {
      if (!isKeyCode(key)) return
      ref.current[map[key]] = false
      emitControls()
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
    }
  }, [map])
}

export function useControls() {
  const controls = useRef<Record<GameControl, boolean>>({
    backward: false,
    brake: false,
    forward: false,
    left: false,
    reset: false,
    right: false,
  })

  useKeyControls(controls, keyControlMap)

  return controls
}
