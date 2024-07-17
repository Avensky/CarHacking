import React, { useState } from 'react';
// import { socket } from '../socket';
import axios from 'axios';

export function Button(props) {
    // const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // functions
    const reload = () => window.location.reload();

    function onSubmit() {
        setIsLoading(true);
        // send commands to backend via http request
        if (props.url) {
            axios.get(props.url)
                .then(response => {
                    setIsLoading(false);
                    console.log(response)
                })
                .catch(error => {

                    console.log(error.response)
                })
        }

        else if (props.reload === true) {
            // setIsLoading(false);
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