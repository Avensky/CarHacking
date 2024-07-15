import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { socket } from './socket';
import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { Events } from "./components/Events";
import { SpeedEvents } from "./components/SpeedEvents";
import { CarShow } from "./CarShow/CarShow";
import { Button } from "./components/Button";
import { MyForm } from "./components/MyForm";
import { Buffer } from 'buffer';
import MatrixRainingCode from './components/Matrix';

// import { MyForm } from './components/MyForm';

// import {
//   EffectComposer,
//   // DepthOfField,
//   // Bloom,
//   // ChromaticAberration,
// } from "@react-three/postprocessing";



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
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [carEvents, setCarEvents] = useState(start);
  // const [canEvents, setCanEvents] = useState(null);
  // const [cmdEvents, setCmdEvents] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('connected');
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('disconnected');
    }

    // function onFooEvent(value) {
    //   console.log('value');
    //   setFooEvents(previous => [...previous, value]);
    // }

    function onCarSim(value) {
      // turn data back into buff for display purposes
      var buff = Buffer.alloc(8)

      buff.writeUIntBE(value.revs, 0, 4)
      buff.writeUIntBE(value.speed, 4, 2)
      buff.writeUIntBE(value.fuel, 6, 2)

      // console.log(buff)
      console.log('setCarEvent', buff);
      setCarEvents(buff);

    }
    function onError(value) {
      setError(value);
      console.log('setError', value);
    }

    // function onCanEvent(value) {
    //   console.log(value);
    //   // setCanEvents(previous => [...previous, value]);
    //   setCanEvents(value);
    // }

    // function onCmdEvent(value) {
    //   console.log(value);
    //   // setCmdEvents(previous => [...previous, value]);
    //   setCmdEvents(value);
    // }

    // socket.on('connection', (socket) => {
    //     console.log(`user connected: ${socket.id}`)
    // });
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // socket.on('foo', onFooEvent);
    // recieve car data using this line
    socket.on('carSim', onCarSim);
    // socket.on('canData', onCanEvent);
    // socket.on('cmd', onCmdEvent);

    socket.on('error', (err) => {
      onError(err);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // socket.off('foo', onFooEvent);
      // disconnect from socket
      // socket.removeAllListeners('canMessage');
      socket.off(`carSim`, onCarSim);
      socket.removeAllListeners(`carSim`);
      // socket.off('canData', onCanEvent);
      // socket.leave('carSim');
      // socket.removeAllListeners('carSim');
      // socket.off('onMessage');
      // socket.removeAllListeners('onMessage')
      socket.off('error', setError);
      // socket.off();
      // socket.off('create-something', onChatEvent);
    };
    // eslint-disable-next-line
  }, []);

  // change color if socket is disconencted
  let conn;
  isConnected ? conn = 'overlay' : conn = 'overlay disconnected'

  let canvas;
  !isConnected
    ? canvas = <MatrixRainingCode />
    : canvas = null;

  return (
    <Suspense fallback={null}>
      <div className='three-d-container'>
        {/* <ThreeD nScale={isMobile ? 1.4 : 1.6} /> */}
        <div className="wrapper">
          {canvas}
          <div className={conn}>
            <Events events={carEvents} />
            {/* <Events events={canEvents} /> */}
            <ConnectionManager />
            <div className="chat">
              <ConnectionState isConnected={isConnected} />
              <Events events={error} />
              <MyForm />
              <div className="flex-row">
                <Button req='get' cmd='' url='/api/start' name="Start" />
                <Button req='get' cmd='' url='/api/stop' name="Abort" />
                <Button req='get' cmd='' url='/api/reload' name="Reload" size="" />
                <Button req='get' cmd='' url='/api/hack' name="Hack" size="" />
                <Button req='get' cmd='' url='/api/vcan' name="VCan" size="" />
              </div>
            </div>
          </div>
          <SpeedEvents events={carEvents || start} />
        </div>
        <div className='three-d'>
          <Canvas shadows><CarShow /></Canvas>
        </div>
      </div>
    </Suspense>
  );
}

export default App;
