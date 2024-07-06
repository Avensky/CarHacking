import React from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    console.log('events', events);
    return (
        <ul>
            {
                events.map((event, index) =>
                    <li key={index}>{event}</li>
                )
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}