import React from 'react';
import PropTypes from 'prop-types';

export function Events({ events }) {
    console.log('Can Events', events);
    return (
        <ul>
            {
                events
            }
        </ul>
    );
}

Events.propTypes = {
    events: PropTypes.any
}