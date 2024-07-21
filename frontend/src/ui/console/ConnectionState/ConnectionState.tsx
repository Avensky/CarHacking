import styles from './ConnectionState.module.css'

export function ConnectionState(props: { isConnected: boolean }): JSX.Element {
    return <div className={styles.ConnectionState}>
        SocketIO Status: {'' + props.isConnected ? 'Live' : 'Offline'}
    </div>
}
