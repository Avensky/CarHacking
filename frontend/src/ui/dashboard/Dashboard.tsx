import { FuelTemp } from './FuelTemp'
import { Speed } from './Speed'
import { Rpms } from './Rpms'
import { getState, subscribe } from '../../store'
import { useEffect, useState } from 'react'

export function Dashboard(): JSX.Element {
  const [physicsData, setPhysicsData] = useState(() => getState().physicsData)

  useEffect(() => {
    // subscribe to store updates
    const unsub = subscribe(() => {
      const next = getState().physicsData
      setPhysicsData(next)
    })

    // clean up on unmount
    return () => unsub()
  }, [])

  if (!physicsData || !physicsData.data) return <></>

  const { speed, engineRpm, fuel, temp } = physicsData.data
  // console.log('dashboard loaded');
  return (
    <div className="dashboard">
      <div className="dash-top">
        <Speed speed={speed} />
        <Rpms rpms={engineRpm / 1000} />
        <FuelTemp fuel={fuel} temp={temp} />
      </div>
    </div>
  )
}
