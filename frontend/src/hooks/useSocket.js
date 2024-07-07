import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url) => {
    const socketRef = useRef(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    // const [isConnected, setIsConnected] = useState(socket.connected);
    // const [canEvents, setCanEvents] = useState([]);
    // const [fooEvents, setFooEvents] = useState([]);
    // const [chatEvents, setChatEvents] = useState([]);

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

        // function onCanEvent(value) {
        //     setCanEvents(value);
        //     console.log('setCanEvent', value);
        // }

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

        socketRef.current = io(url);
        // socketRef.current.on('connect', () => {
        //     console.log('Connected to Socket.IO server');
        // });

        socketRef.current.on('can message', (message) => {
            setData(message);
        });

        socketRef.current.on('error', (err) => {
            setError(err);
        });

        return () => {
            socketRef.current.disconnect();
            // socket.off('connect', onConnect);
            // socket.off('disconnect', onDisconnect);
            // socket.off('foo', onFooEvent);
            // can
            // socket.off('can message', onCanEvent);
            // socket.off('create-something', onChatEvent);
            // socket.removeAllListeners('can message')
        };
    }, [url]);

    return { data, error };
};

export default useSocket;
