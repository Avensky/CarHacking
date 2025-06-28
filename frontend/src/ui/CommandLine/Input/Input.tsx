import React, { useEffect, useState, useRef } from 'react'
// import { socket } from '../socket';
import axios from 'axios'
import styles from './Input.module.css'

export default function Input({
  clearInputFlag,
  setClearInputFlag
}: {
  clearInputFlag: boolean;
  setClearInputFlag: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); // ✅Reselect input after submit
  const [shouldFocus, setShouldFocus] = useState(false);


  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        setHistoryIndex((prev) => {
          const nextIndex = prev === null ? history.length - 1 : Math.max(prev - 1, 0);
          setValue(history[nextIndex]);
          return nextIndex;
        });
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length > 0) {
        setHistoryIndex((prev) => {
          if (prev === null) return null; // nothing selected yet
          const nextIndex = Math.min(prev + 1, history.length - 1);
          setValue(history[nextIndex]);
          return nextIndex;
        });
      }
    }
  }

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
        setHistory((prev) => [...prev, value]);   // ✅ Add to history
        setHistoryIndex(null);                    // ✅ Reset index
        setValue('');                             // ✅ Clear input
        setShouldFocus(true);         // ✅ next render will re-focus!
        console.log(response.data);
      })
      .catch((error) => {
        setIsLoading(false)
        setValue('');
        setShouldFocus(true);         // ✅ next render will re-focus!
        console.log(error.response)
      })
  }

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
      setShouldFocus(false);  // ✅ don’t run again until next submit
    }
  }, [shouldFocus]);

  useEffect(() => {
    if (clearInputFlag) {
      setValue('');
      setShouldFocus(true);        // ✅ reuse your focus flag!
      setClearInputFlag(false);
    }
  }, [clearInputFlag]);

  return (
    <form onSubmit={onSubmit} className={styles.MyForm}>
      <div className={styles.PromptLine}>
        <span className={styles.PromptSymbol}>$</span>
        <input
          ref={inputRef}
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder="Whats on your mind?"
          disabled={isLoading}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button type="submit" disabled={isLoading} />
    </form>
  )
}
