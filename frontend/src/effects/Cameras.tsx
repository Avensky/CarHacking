import { PerspectiveCamera, OrthographicCamera, OrbitControls } from '@react-three/drei'
import { useStore } from '../store'
import { RotatingCamera } from './RotatingCamera'
import { useRef } from 'react';
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { MathUtils, Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
const { lerp } = MathUtils
import { PerspectiveCamera as ThreePerspectiveCamera } from 'three';

export function Cameras() {
  const [camMode, editor] = useStore((state) => [state.camera, state.editor])
  const controlsRef = useRef<ThreeOrbitControls | null>(null)


  // const game = <>
  //   <PerspectiveCamera
  //     makeDefault={!editor && camMode !== 'BIRD_EYE'}
  //     fov={75}
  //     rotation={[0, 0, 0]}
  //     position={[0, 15, 25]} />
  //   <OrthographicCamera
  //     makeDefault={!editor && camMode === 'BIRD_EYE'}
  //     // position={[0, 1, 0]}
  //     rotation={[(-1 * Math.PI) / 2, 0, Math.PI / 2]}
  //     zoom={1} />
  // </>



  // return editor ? (
  //   <OrthographicCamera
  //     makeDefault={editor}
  //     position={[0, 50, 0]}
  //     zoom={10}
  //   />
  // ) : (
  //   <>
  //     <OrbitControls
  //       makeDefault
  //       ref={controlsRef} // Allows Rotating camera to delay automatic mode
  //       maxPolarAngle={Math.PI / 2 - 0.05} // just above flat (prevents looking under)
  //       minPolarAngle={0} // from straight above
  //       enableZoom={true}
  //       minDistance={5}
  //       maxDistance={13}
  //     /><RotatingCamera
  //       orbitRef={controlsRef}
  //       radius={7} speed={0.2} height={3}
  //       resumeDuration={5}
  //     />
  //   </>
  // )


  if (editor) {
    return (
      <OrthographicCamera
        makeDefault
        position={[0, 50, 0]}
        zoom={20}
      />
    )
  }

  switch (camMode) {
    case 'GALLERY':
      return (
        <>
          <OrbitControls
            makeDefault
            ref={controlsRef}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minPolarAngle={0}
            enableZoom={true}
            minDistance={5}
            maxDistance={13}
          />
          <RotatingCamera
            orbitRef={controlsRef}
            radius={7}
            speed={0.2}
            height={3}
            resumeDuration={5}
          />
        </>
      );

    case 'BIRD_EYE':
      return (
        <OrthographicCamera
          makeDefault
          rotation={[(-1 * Math.PI) / 2, 0, Math.PI / 2]}
          zoom={1}
        />
      );

    case 'FIRST_PERSON':
      return (<>

        <PerspectiveCamera
          makeDefault
          fov={75}
          position={[0, 3, 6]}
        // rotation={[0, 0, 0]}
        />
      </>
      );

    case 'DEFAULT':
    default:
      return (
        <>

          <PerspectiveCamera
            makeDefault
            fov={75}
            // rotation={[0, 0, 0]}
            position={[0, 8, 15]}
          // ref={cameraRef}
          />

        </>);
  }
}
