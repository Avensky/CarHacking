import { useState } from 'react'
// import { socket } from '../socket';
import axios from 'axios'

export function Button(props: { url: string; reload: boolean; name: string }): JSX.Element {
    // const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false)

    // functions
    const reload = () => window.location.reload()

    function onSubmit() {
        setIsLoading(true)
        // send commands to backend via http request
        if (props.url && !props.reload) {
            axios.get(props.url)
                .then((response: any) => {
                    setIsLoading(false)
                    console.log(response)
                })
                .catch((error: { response: any; }) => {
                    setIsLoading(false)
                    console.log(error.response)
                })
        }

        else if (props.reload === true) {
            setIsLoading(false)
            console.log('reload')
            reload()
        }
    }
    return (
        <div
            className={isLoading ? 'start loading' : 'start'}
            onClick={onSubmit}
        // disabled={isLoading}
        >
            {props.name}
        </div>

    )
}
