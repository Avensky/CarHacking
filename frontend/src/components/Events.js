import React from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    // console.log('error event', events);
    return (
        <ul>
            {
                events ? events.map((event, index) =>
                    <li key={index}>{event}</li>
                ) : null
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}