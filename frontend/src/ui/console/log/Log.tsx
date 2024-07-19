import styles from './Log.module.css'

export function Log(props: { events: any }): JSX.Element {
    return (
        <div className={styles.Events}>
            <div className={styles.EventLog}>
                {
                    props.events.length > 0 ? props.events.map((event: any, index: any) =>
                        <div className={styles.Event} key={index}>{event}</div>
                    ) : null
                }
            </div>
        </div>
    )
}
