import React from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    console.log('Can Events', events);
    let index = 0;
    return (
        <ul>
            {
                events ? events.map(event => {
                    return <li key={index++}>{event}</li>
                }) : null
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}