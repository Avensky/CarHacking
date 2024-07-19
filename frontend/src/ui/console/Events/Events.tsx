// import styles from './Events.module.css';

export function Events(props: { events: any }): JSX.Element {
    return (
        <div
        // className={styles.Events}
        >
            <div
            // className={styles.EventLog}
            >
                {
                    props.events.length > 0 ? props.events.map((event: any, index: any) =>
                        <div
                            // className={styles.Event} 
                            key={index}>{event}</div>
                    ) : null
                }
            </div>
        </div>
    )
}
