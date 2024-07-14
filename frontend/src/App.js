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
  const [canEvents, setCanEvents] = useState(null);
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

    function onCarEvent(value) {
      setCarEvents(value);
      console.log('setCarEvent', value);

    }
    function onError(value) {
      setError(value);
      console.log('setError', value);
    }

    function onCanEvent(value) {
      console.log(value);
      setCanEvents(previous => [...previous, value]);
      // setCanEvents(value);
    }

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
    socket.on('carSim', onCarEvent);
    socket.on('canData', onCanEvent);
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
      socket.off(`carSim`, onCarEvent);
      socket.removeAllListeners(`carSim`);
      socket.off('canData', onCanEvent);
      // socket.leave('carSim');
      // socket.removeAllListeners('carSim');
      // socket.off('onMessage');
      // socket.removeAllListeners('onMessage')
      socket.off('error', setError);
      // socket.off();
      // socket.off('create-something', onChatEvent);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <div className='three-d-container'>
        {/* <ThreeD nScale={isMobile ? 1.4 : 1.6} /> */}
        <div className="wrapper">
          <div className="chat">
            <MyForm />
            <ConnectionState isConnected={isConnected} />
            <Events events={canEvents} />
            <Events events={error} />
            <ConnectionManager />
            <Button />
          </div>
          <SpeedEvents events={carEvents || start} />
        </div>
        <div className='three-d'>
          <Canvas shadows>
            <CarShow />
          </Canvas>
        </div>
      </div>
    </Suspense>
  );
}

export default App;
