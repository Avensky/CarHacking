import styles from './ConnectionState.module.css'

export function ConnectionState(props: { isConnected: boolean }): JSX.Element {
    return <div className={styles.ConnectionState}>
        Live Socket Connection: {'' + props.isConnected}
    </div>
}
