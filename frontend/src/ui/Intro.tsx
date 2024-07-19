import { Suspense, useEffect, useState } from 'react'
// import { Footer } from '@pmndrs/branding'
import { useProgress } from '@react-three/drei'

import type { ReactNode } from 'react'
// import { useStore } from '../store'

export function Intro({ children }: { children: ReactNode }): JSX.Element {
  const [clicked, setClicked] = useState(false)
  const [loading, setLoading] = useState(true)
  const { progress } = useProgress()
  // const [session, set] = useStore((state) => [state.session, state.set])

  // useEffect(() => {
  //   if (clicked && !loading) set({ ready: true })
  // }, [clicked, loading])

  useEffect(() => {
    if (progress === 100) {
      setLoading(false)
      // set({ ready: true })
      setClicked(true)
    }
  }, [progress])


  return (
    <>
      <Suspense fallback={null}>{children}</Suspense>
      <div className={`fullscreen bg ${loading ? 'loading' : 'loaded'} ${clicked && 'clicked'}`}>
        <div className="stack">
          <div className="intro-keys">
            {/* <Keys style={{ paddingBottom: 20 }} /> */}
            <a className="start-link" href="#" onClick={() => setClicked(true)}>
              {loading ? `loading ${progress.toFixed()} %` : 'Starting'}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
