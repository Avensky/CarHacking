import React, { useEffect, useState } from 'react';
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
    // const [speed, setSpeed] = useState(events.speed)
    console.log('speed events', events);
    console.log('speed events', events.speed);

    // useEffect(() => {
    //     if (events.speed != speed) {
    //         setSpeed(events.speed);
    //     }
    // }, [events.speed])

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