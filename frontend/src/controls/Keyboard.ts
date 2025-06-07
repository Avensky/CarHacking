import { MutableRefObject, useEffect, useRef } from 'react'
import { keys } from '../keys'
import { isControl, useStore, getState } from '../store'
import type { BindableActionName } from '../store'
import socket from '../socket'
import { type Controls } from '../store'

let controls: Controls
export function Keyboard() {
  const [actionInputMap, actions, binding] = useStore(({ actionInputMap, actions, binding }) => [actionInputMap, actions, binding])

  controls = getState().controls
  useEffect(() => {
    if (binding) return
    const keyMap: Partial<Record<string, BindableActionName>> = keys(actionInputMap).reduce(
      (out, actionName) => ({ ...out, ...actionInputMap[actionName].reduce((inputs, input) => ({ ...inputs, [input]: actionName }), {}) }),
      {},
    )
    console.log('🚀 useKeyControls initialized')
    const downHandler = ({ key, target }: KeyboardEvent) => {
      const actionName = keyMap[key.toLowerCase()]
      if (key.toLowerCase() === "r") {
        console.log("Reset key pressed ✅");
        socket.emit("controls", { reset: true });
        return; // ⬅ prevent further processing for 'r'
      }

      if (!actionName || (target as HTMLElement).nodeName === 'INPUT' || !isControl(actionName)) return
      actions[actionName](true)
      socket.emit('controls', getState().controls)

    }
    const upHandler = ({ key, target }: KeyboardEvent) => {
      const actionName = keyMap[key.toLowerCase()]
      if (!actionName || (target as HTMLElement).nodeName === 'INPUT') return
      actions[actionName](false)
      socket.emit('controls', getState().controls)
    }

    window.addEventListener('keydown', downHandler, { passive: true })
    window.addEventListener('keyup', upHandler, { passive: true })

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [actionInputMap, binding])

  return null
}
