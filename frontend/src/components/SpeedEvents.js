import React, { useState } from 'react';
import PropTypes from 'prop-types';
// speedometer
import Speedometer, {
    Background,
    Arc,
    Needle,
    Progress,
    Marks,
    Indicator,
} from 'react-speedometer';

export function SpeedEvents({ events }) {
    // const [ speed, setSpeed ] = useState('')
    console.log('events', events);
    console.log('events', events.speed);

    return (
        <div className="speedometer">
            <Speedometer
                value={events.speed}
                fontFamily='squada-one'
            >
                <Background />
                <Arc />
                <Needle />
                <Progress />
                <Marks />
                <Indicator />
            </Speedometer>
        </div>
    );
}

SpeedEvents.propTypes = {
    events: PropTypes.any
}