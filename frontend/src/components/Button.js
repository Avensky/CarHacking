import React, { useState } from 'react';
// import { socket } from '../socket';
import axios from 'axios';

export function Button(props) {
    // const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const reload = () => window.location.reload();
    function onSubmit() {
        setIsLoading(true);
        // send commands to backend via http request
        axios.get(props.url)
            .then(response => {
                setIsLoading(false);
                console.log(response)
            })
            .catch(error => {
                setIsLoading(false);
                console.log(error.response)
            })
        if (props.reload === true) {
            reload()
        }
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