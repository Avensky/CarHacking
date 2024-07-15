import React from 'react';
import { socket } from '../socket';
import styles from './ConnectionManager.module.css';

export function ConnectionManager() {

    function connect() {
        socket.connect();
    }

    function disconnect() {
        socket.disconnect();
    }

    return (
        <div className={styles.ConnectionManager}>
            <button onClick={connect}>Connect</button>
            <button onClick={disconnect}>Disconnect</button>
        </div>
    );
}