// import { useState } from 'react' 
import socket from '../../../socket'
import { ConnectionState } from '../ConnectionState/ConnectionState'
import styles from './ConnectionManager.module.css'
// import axios from 'axios';
export function ConnectionManager(props: { isConnected: boolean }): JSX.Element {

    // const [loading, setLoading] = useState(false);

    function connect() {
        socket.connect()
        // setLoading(true)
    }

    function disconnect() {
        socket.disconnect()
        // setLoading(false)
    }

    // console.log(loading);

    return (
        <div className={styles.ConnectionManager}>
            <button
                className={props.isConnected
                    ? styles.Grey
                    : styles.White
                }
                onClick={connect}>On</button>
            <button
                className={props.isConnected
                    ? styles.White
                    : styles.Grey
                }
                onClick={disconnect}
                disabled={props.isConnected ? false : true}
            >Off</button>
            <ConnectionState isConnected={props.isConnected} />
        </div>
    )
}
