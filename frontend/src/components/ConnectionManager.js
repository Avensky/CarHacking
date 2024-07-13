import React from 'react';
import { socket } from '../socket';
import axios from 'axios';

export function ConnectionManager() {

    function connect() {
        axios.get('/api/start')
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                console.log(error.response)
            })
        // socket.connect();
    }

    function disconnect() {
        socket.disconnect();
    }

    return (
        <>
            <button onClick={connect}>Connect</button>
            <button onClick={disconnect}>Disconnect</button>
        </>
    );
}