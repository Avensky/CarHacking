import { useEffect, useRef } from 'react'
import styles from './Log.module.css'

export function Log(props: { events: any }): JSX.Element {
    const logEndRef = useRef(null)
    const scrollToBottom = () => {
        logEndRef.current.scrollIntoView({ behavior: 'instant' })
    }
    useEffect(scrollToBottom, [props.events])
    return (
        <div className={styles.Log}>
            <div className={styles.Messages}>

                {
                    props.events.length > 0 ? props.events.map((event: any, index: any) =>
                        <span className={styles.Event} key={index}>{event}</span>
                    ) : null
                }
                <div ref={logEndRef} />
            </div>
        </div>
    )
}
