import { useState } from 'react'
// import { socket } from '../../../socket';
import axios from 'axios'

export function Button(props: { url: string; reload: boolean; name: string}): JSX.Element {
  // const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  // functions
  const reload = () => window.location.reload()

  function onSubmit() {
    setIsLoading(true)
  
    // send commands to backend via http request
   
    if (props.name=="Abort"){
      axios.get('/api/stop').then((response) => {
        // console.log(response)
      })
      .catch((error: { response: any }) => {
        // console.log(error.response)
      })
    }

    if (props.url && !props.reload) {
      axios.get(props.url)
        .then(() => {
          setIsLoading(false)
          // console.log(response)
        })
        .catch((error: { response: any }) => {
          setIsLoading(false)
          // console.log(error.response)
        })
    } else if (props.reload === true) {
      setIsLoading(false)
      // console.log('reload')
      reload()
    }
  }
  return (
    <div
      className={isLoading ? 'btn loading' : 'btn'}
      onClick={onSubmit}
      // disabled={isLoading}
    >
      {props.name}
    </div>
  )
}
