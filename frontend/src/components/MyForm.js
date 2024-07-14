import React, { useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';

export function MyForm() {
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function onSubmit(event) {
        event.preventDefault();
        setIsLoading(true);

        socket.timeout(3000).emit('canData', value, () => {
            console.log('submit command');
            const object = { data: value }
            axios.post('/api/cmd', object)
                .then(response => {
                    setIsLoading(false);
                    setValue('');
                    console.log(response.data)
                })
                .catch(error => {
                    setIsLoading(false);
                    setValue('');
                    console.log(error.response)
                })
        });

    }

    return (
        <form onSubmit={onSubmit}>
            <input onChange={e => setValue(e.target.value)} />
            <button type="submit" disabled={isLoading}>Submit</button>
        </form>
    );
}