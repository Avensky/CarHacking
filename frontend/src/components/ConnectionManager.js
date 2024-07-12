import React from 'react';
import { socket } from '../socket';
import axios from 'axios';

export function ConnectionManager() {

    const base_url = process.env.NODE_ENV === "production"
        ? "http://192.168.0.153/api/start"
        : "http://127.0.0.1:5000/api/start"

    function connect() {
        axios.get(base_url)
            .then(response => {
                console.log(response)
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