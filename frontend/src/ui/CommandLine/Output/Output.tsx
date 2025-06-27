import { JSXElementConstructor, Key, ReactElement, ReactNode, useEffect, useRef } from 'react';
import styles from './Output.module.css';

export default function Output(props: { events: any }): JSX.Element {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  };

  useEffect(scrollToBottom, [props.events]);

  return (
    <div className={styles.Log}>
      <div className={styles.Messages}>
        {props.events.map((e: any, i: Key) => {
          let className = styles.Event;

          if (typeof e === 'string') {
            if (e.toLowerCase().includes('error')) className += ` ${styles['event-error']}`;
            else if (e.toLowerCase().includes('success')) className += ` ${styles['event-success']}`;
            else if (e.toLowerCase().includes('debug')) className += ` ${styles['event-debug']}`;
            else className += ` ${styles['event-info']}`;
          }

          return (
            <div key={i} className={className}>
              {typeof e === 'string' ? e : JSON.stringify(e, null, 2)}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
