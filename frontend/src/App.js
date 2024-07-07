import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
// import { BlendFunction } from "postprocessing";
import {
  CubeCamera,
  Environment,
  OrbitControls,
  PerspectiveCamera,

} from "@react-three/drei";

// import { Boxes } from "./Boxes";
import { Car } from "./Car.js";
// import { City } from "./City";
import { Ground } from "./Ground.js";
// import { FloatingGrid } from "./FloatingGrid";
// import { Rings } from "./Rings";

// Socket.io imports
import { socket } from './socket.js';
// import useSocket from "./hooks/useSocket.js";
// import { ConnectionState } from './components/ConnectionState.js';
// import { ConnectionManager } from './components/ConnectionManager.js';
import { Events } from "./components/Events.js";
import { SpeedEvents } from "./components/SpeedEvents.js";
// import { MyForm } from './components/MyForm.js';

// import {
//   EffectComposer,
//   // DepthOfField,
//   // Bloom,
//   // ChromaticAberration,
// } from "@react-three/postprocessing";

function CarShow() {
  return (
    <>
      {/* Allows camera to orbit around target  */}
      <OrbitControls
        target={[0, 0.55, 0]}
        setPolarAngle={1.55}
        maxPolarAngle={1.65} // how far orbit vertically
        maxDistance={.9}
        minDistance={.9}
        enablePan={false}
      />
      {/* This projection mode is designed to mimic the way the human eye sees.  */}
      <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />

      {/* background color */}
      <color args={['#fff']} attach="background" />

      {/* Creates 6 cameras that render to a WebGLCubeRenderTarget. */}
      <CubeCamera resolution={256} frames={60}>
        {(texture) => (
          <>
            <Environment map={texture} />
            {/* <City /> */}
            <Car />
          </>
        )}
      </CubeCamera>

      {/* This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets. */}
      {/* <spotLight
        color={[1, 0.25, 0.7]}
        intensity={1.5}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      /> */}

      {/* <spotLight
        color={[0.14, 0.5, 1]}
        intensity={2}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      /> */}
      <Ground />
      {/* <FloatingGrid /> */}
      {/* <Boxes /> */}
      {/* <Rings /> */}

      {/* <EffectComposer> */}
      {/* <DepthOfField focusDistance={0.0035} focalLength={0.01} bokehScale={3} height={480} /> */}
      {/* <Bloom        blendFunction={BlendFunction.ADD}
          intensity={1.3} // The bloom intensity.
          width={300} // render width
          height={300} // render height
          kernelSize={5} // blur kernel size
          luminanceThreshold={0.15} // luminance threshold. Raise this value to mask out darker elements in the scene.
          luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
        /> */}
      {/* <ChromaticAberration
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={[0.0005, 0.0012]} // color offset
        /> */}
      {/* </EffectComposer> */}

    </>
  );
}

function App() {
  // "undefined" means the URL will be computed from the `window.location` object
  // const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';

  // const { data, error } = useSocket(URL);
  // const [socketData, setSocketData] = useState(null);

  const start = {
    speed: 0,
    rpms: 0,
    fuel: 0,
    temp: 0
  };
  const [error, setError] = useState(null);
  // const [isConnected, setIsConnected] = useState(socket.connected);
  const [canEvents, setCanEvents] = useState(start);

  useEffect(() => {
    // function onConnect() {
    //     setIsConnected(true);
    //     console.log('connected');
    // }

    // function onDisconnect() {
    //     setIsConnected(false);
    //     console.log('disconnected');
    // }

    // function onFooEvent(value) {
    //   console.log('value');
    //   setFooEvents(previous => [...previous, value]);
    // }

    function onCanEvent(value) {
      setCanEvents(value);
      console.log('setCanEvent', value);
    }
    function onError(value) {
      setError(value);
      console.log('setError', value);
    }

    // function onChatEvent(value) {
    //   console.log('value');
    //   setChatEvents(previous => [...previous, value]);
    // }

    // socket.on('connection', (socket) => {
    //     console.log(`user connected: ${socket.id}`)
    // });
    // socket.on('connect', onConnect);
    // socket.on('disconnect', onDisconnect);
    // socket.on('foo', onFooEvent);
    // can
    // socket.on('can message', onCanEvent);
    // socket.on('create-something', onChatEvent);

    // socketRef.current = io(url);
    // socketRef.current.on('connect', () => {
    //     console.log('Connected to Socket.IO server');
    // });

    socket.on('can message', (message) => {
      onCanEvent(message);
    });

    socket.on('error', (err) => {
      onError(err);
    });

    return () => {
      // socketRef.current.disconnect();
      // socket.off('connect', onConnect);
      // socket.off('disconnect', onDisconnect);
      // socket.off('foo', onFooEvent);
      // can
      socket.off('can message', onCanEvent);
      socket.off('error', setError);
      // socket.off('create-something', onChatEvent);
      // socket.removeAllListeners('can message')
    };
  }, []);



  return (
    <Suspense fallback={null}>
      <div className="wrapper">
        <div className="chat">
          {/* <ConnectionState isConnected={isConnected} /> */}
          {/* <Events events={fooEvents} /> */}
          <Events events={error} />
          {/* <ConnectionManager /> */}
          {/* <MyForm /> */}
        </div>

        <SpeedEvents events={canEvents || start} />

        <Canvas shadows>
          <CarShow />
        </Canvas>
      </div>
    </Suspense>
  );
}

export default App;
