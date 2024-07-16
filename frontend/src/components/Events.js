import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    // const [log, setLog] = useState([]);
    const log = useState([]);

    useEffect(() => {
        console.log('Events', events);
        if (events) {
            log.push(events);
        }
        // eslint-disable-next-line
    }, [events])


    return (
        <ul>
            {
                events ? log.map(event => {
                    return <li key={log.length}>{event}</li>
                }) : null
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}