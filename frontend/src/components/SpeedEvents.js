import React from 'react';
import PropTypes from 'prop-types';

export function SpeedEvents({ events }) {
    console.log('events', events);
    return (
        <ul>
            {
                // events.map((event, index) =>
                //     <li key={index}>{event}</li>
                // )
            }
        </ul>
    );
}

SpeedEvents.propTypes = {
    events: PropTypes.any
}