import React, { useState } from 'react'
// import { socket } from '../socket';
import axios from 'axios'
import styles from './Input.module.css'

export default function Input() {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    // socket.emit('canData', value, () => {
    //     console.log('submit command');
    // });

    axios
      .post('/api/v1/cmd/', { data: value })
      .then((response) => {
        setIsLoading(false)
        // setValue('');
        console.log(response.data)
      })
      .catch((error) => {
        setIsLoading(false)
        // setValue('');
        console.log(error.response)
      })
  }

  return (
    <form onSubmit={onSubmit} className={styles.MyForm}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What's on your mind?"
        autoFocus
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading} />
    </form>
  )
}
