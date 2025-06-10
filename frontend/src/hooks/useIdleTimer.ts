// hooks/useIdleTimer.ts
import { useEffect, useState, useRef } from 'react'

export default function useIdleTimer(timeout = 5000) {
    const [isIdle, setIsIdle] = useState(false)
    const lastInteraction = useRef(Date.now())

    useEffect(() => {
        const onUserInput = () => {
            lastInteraction.current = Date.now()
            setIsIdle(false)
        }

        const events = ['mousedown', 'touchstart', 'wheel', 'keydown']
        events.forEach(e => window.addEventListener(e, onUserInput))

        const interval = setInterval(() => {
            if (Date.now() - lastInteraction.current > timeout) {
                setIsIdle(true)
            }
        }, 300)

        return () => {
            events.forEach(e => window.removeEventListener(e, onUserInput))
            clearInterval(interval)
        }
    }, [timeout])

    return isIdle
}
