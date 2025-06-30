import { Key, useEffect, useRef } from 'react';
import styles from './Output.module.css';
interface OutputProps {
  events: any[];
  paused: boolean;
  logs: any[];
  cli: boolean;  // ✅ new prop!
}

export default function Output({ events, paused, logs, cli }: OutputProps): JSX.Element {
  const logEndRef = useRef<HTMLDivElement | null>(null);


  // Auto Scroll
  const scrollToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  };

  useEffect(scrollToBottom, [logs]);

  return (
    <div style={{
      // pointerEvents: cli ? 'auto' : 'none',
    }}
      className={styles.Log}>
      <div className={styles.Messages}>
        {logs.map((e: any, i: Key) => {
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
