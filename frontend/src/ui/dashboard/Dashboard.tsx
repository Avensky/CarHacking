import { FuelTemp } from './FuelTemp'
import Speedometer from './Speedometer'
import { Rpms } from './Rpms'
import { getState, subscribe } from '../../store'
import { useEffect, useState } from 'react'

export function Dashboard(): JSX.Element {
  const [physicsData, setPhysicsData] = useState(() => getState().physicsData)
  const vehicleConfig = getState().vehicleConfig
  const DASH_SIZE = 1;

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

  const { speed, engineRpm, fuel, temp, gear } = physicsData.data
  const fuelCapacity = vehicleConfig.fuelCapacity
  // console.log('dashboard loaded');
  return (
    <div className="dashboard">
      <div className="dash-top">
        <Speedometer speed={speed} scale={90} />
        <Rpms size={DASH_SIZE} rpms={engineRpm / 1000} gear={gear} />
        <FuelTemp size={DASH_SIZE} fuel={fuel} fuelCapacity={fuelCapacity} temp={temp} />
      </div>
    </div>
  )
}
