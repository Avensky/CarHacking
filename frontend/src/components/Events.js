import React from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    return (
        <ul>
            {
                events.length > 0 ? events.map((event, index) =>
                    <li key={index}>{event}</li>
                ) : null
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}