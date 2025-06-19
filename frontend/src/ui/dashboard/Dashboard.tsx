import { FuelTemp } from './FuelTemp'
import { Speed } from './Speed'
import { Rpms } from './Rpms'
import { getState, subscribe } from '../../store'
import { useEffect, useState } from 'react'

export function Dashboard(): JSX.Element {
  const [physicsData, setPhysicsData] = useState(() => getState().physicsData)
  const vehicleConfig = getState().vehicleConfig

  useEffect(() => {
    // subscribe to store updates
    const unsub = subscribe(() => {
      const next = getState().physicsData
      setPhysicsData(next)
    })

    // clean up on unmount
    return () => unsub()
  }, [])

  if (!physicsData || !physicsData.data || !vehicleConfig) return <></>
  // console.log('vehicleConfig', vehicleConfig);

  const { speed, engineRpm, fuel, temp } = physicsData.data
  const fuelCapacity = vehicleConfig.fuelCapacity
  // console.log('dashboard loaded');
  return (
    <div className="dashboard">
      <div className="dash-top">
        <Speed speed={speed} />
        <Rpms rpms={engineRpm / 1000} />
        <FuelTemp fuel={fuel} fuelCapacity={fuelCapacity} temp={temp} />
      </div>
    </div>
  )
}
