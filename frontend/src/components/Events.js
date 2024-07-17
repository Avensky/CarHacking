import React from 'react';
import PropTypes from 'prop-types';
import styles from './Events.module.css';

export function Events({ events }) {
    return (
        <div className={styles.Events}>
            {
                events.length > 0 ? events.map((event, index) =>
                    <div className={styles.Event} key={index}>{event}</div>
                ) : null
            }
        </div>
    );
}

Events.propTypes = {
    events: PropTypes.any
}