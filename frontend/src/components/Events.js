import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    const [log, setLog] = useState(null);

    console.log('Can Events', events);
    let index = 0;
    useEffect(() => {
        if (events) {
            setLog(...log, events)
        }
        // eslint-disable-next-line
    }, [events])
    return (
        <ul>
            {
                events ? log.map(event => {
                    return <li key={index++}>{event}</li>
                }) : null
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}