import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import { useStore } from '../store'

export function Cameras() {
  const [camera, editor] = useStore((state) => [state.camera, state.editor])
  return editor ? (
    <OrthographicCamera
      makeDefault={editor}
      position={[0, 50, 0]}
      zoom={10}
    />
  ) : (
    <>
      <PerspectiveCamera
        makeDefault={!editor && camera !== 'BIRD_EYE'}
        fov={75}
        rotation={[0, 0, 0]}
        position={[0, 15, 25]} />
      <OrthographicCamera
        makeDefault={!editor && camera === 'BIRD_EYE'}
        position={[0, 50, 0]}
        rotation={[(-1 * Math.PI) / 2, 0, 0]}
        zoom={15} />
    </>
  )
}
