import socket from '../../../socket'
import { ConnectionState } from '../ConnectionState/ConnectionState'
import styles from './ConnectionManager.module.css'

export function ConnectionManager(props: { isConnected: boolean }): JSX.Element {

    function connect() {
        socket.connect()
    }

    function disconnect() {
        socket.disconnect()
    }

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
