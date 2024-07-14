import React, { useState } from 'react';
import { socket } from '../socket';

export function Button() {
    // const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function onSubmit(event) {
        event.preventDefault();
        setIsLoading(!isLoading);

        socket.timeout(5000).emit(
            `${socket.id}`,
            'ENGINE SIMULATION ENGAGED',
            () => {
                console.log('submit event');
                setIsLoading(false);
                // setValue('');
            }
        );
    }
    return (
        <button
            className={isLoading ? 'start loading' : 'start'}
            onClick={onSubmit}
            disabled={isLoading}
        >
            Start
        </button>

    );
}