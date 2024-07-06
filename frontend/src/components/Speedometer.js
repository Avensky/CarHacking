import React from 'react';
import PropTypes from 'prop-types';

export function Speedometer({ events }) {
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

Speedometer.propTypes = {
    events: PropTypes.any
}