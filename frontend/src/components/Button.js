import React, { useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';

export function Button(props) {
    // const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function onSubmit() {
        // event.preventDefault();
        setIsLoading(true);

        socket.emit(
            `canData`,
            'Command Sent to Backend',
            () => {
                console.log('submit event');
                setIsLoading(false);
            }
        );
        // start engine.js script via http request
        axios.get(props.url)
            .then(response => {
                setIsLoading(false);
                console.log(response)
            })
            .catch(error => {
                setIsLoading(false);
                console.log(error.response)
            })
    }
    return (
        <div
            className={isLoading ? 'start loading' : 'start'}
            onClick={onSubmit}
            disabled={isLoading}
        >
            {props.name}
        </div>

    );
}