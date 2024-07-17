import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from '@react-three/drei';
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { Events } from "./components/Events";
import { SpeedEvents } from "./components/SpeedEvents";
import { CarShow } from "./CarShow/CarShow";
import { Button } from "./components/Button";
import { MyForm } from "./components/MyForm";
import MatrixRainingCode from './components/Matrix';
// import {
//   EffectComposer,
//   // DepthOfField,
//   // Bloom,
//   // ChromaticAberration,
// } from "@react-three/postprocessing";

function App() {
  const start = { speed: 0, rpms: 0, fuel: 0, temp: 0 };
  // const [error, setError] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [carEvents, setCarEvents] = useState(start);
  const [cmdEvents, setCmdEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('connected');
    }
    function onDisconnect() {
      setIsConnected(false);
      console.log('disconnected');
    }
    function onCarSim(value) { setCarEvents(value); }
    // function onError(value) {
    //   setError(value);
    //   console.log('setError', value);
    // }
    function onCmdEvent(value) {
      console.log(value);
      setCmdEvents(previous => [...previous, value]);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('carSim', onCarSim);
    socket.on('cmdData', onCmdEvent);
    // socket.on('error', (err) => {
    //   onError(err);
    // });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(`carSim`, onCarSim);
      socket.removeAllListeners(`carSim`);
      socket.off('cmdData', onCmdEvent);
      // socket.off('error', setError);
    };
    // eslint-disable-next-line
  }, []);

  // change color if socket is disconencted
  let conn;
  isConnected ? conn = '' : conn = ' disconnected'

  let canvas;
  !isConnected
    ? canvas = <MatrixRainingCode />
    : canvas = null;

  return (
    <div className='three-d-container'>
      {/* <ThreeD nScale={isMobile ? 1.4 : 1.6} /> */}
      <div className="wrapper">
        {canvas}
        <div className='overlay'>
          <div className={conn}>
            {isConnected === true
              ? <>
                <Events events={cmdEvents} />
                {/* <Events events={canEvents} /> */}
                {/* <Events events={error} /> */}
              </>
              : null}
          </div>
          <ConnectionManager />
          <div className="command">
            <ConnectionState isConnected={isConnected} />
            <div>
              {isConnected === true
                ? <>
                  <MyForm />
                  <div className="flex-row">
                    <Button req='get' cmd='' url='/api/start' name="Start" />
                    <Button req='get' cmd='' url='/api/hack' name="Hack" size="" />
                    <Button req='get' cmd='' url='/api/reload' name="Reload" size="" reload={true} />
                    <Button req='get' cmd='' url='/api/abort' name="Abort" />
                    <Button req='get' cmd='' url='/api/vcanAdd' name="Add VCan" size="" />
                    <Button req='get' cmd='' url='/api/vcanSetup' name="Setup VCan" size="" />
                  </div>
                </>
                : null
              }
            </div>
          </div>
        </div>
        <SpeedEvents events={carEvents || start} />
      </div>
      <div className='three-d'>
        <Canvas shadows>
          <Suspense fallback={null}>
            <CarShow />
          </Suspense>
        </Canvas>
        <Loader />
      </div>
    </div>
  );
}

export default App;
