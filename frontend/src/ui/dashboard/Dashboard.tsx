import { useEffect, useState } from 'react'
import FuelTemp from './FuelTemp'
import Speedometer from './Speedometer'
import Revolutions from './Revolutions'
import { getState, subscribe } from '../../store'

export function Dashboard(): JSX.Element {
  const [physicsData, setPhysicsData] = useState(() => getState().physicsData)
  const engineOn = getState().controls.engineOn
  const vehicleConfig = getState().vehicleConfig
  const size = 100;
  const sizeBig = size * 1.1;

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
      <div style={{
        position: 'relative',
        width: `${size * 3}px`, // total width for all 3 clusters
        height: `${sizeBig}px`, // tallest cluster
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Speedometer */}
        <div style={{
          zIndex: 1,
          position: 'relative',
          marginRight: `-${size * 0.15}px` // overlap 10% into RPM
        }}>
          <Speedometer speed={speed} scale={size} />
        </div>

        {/* Revolutions in center */}
        <div style={{
          zIndex: 2,
          position: 'relative'
        }}>
          <Revolutions
            engineOn={engineOn}
            speed={speed}
            scale={sizeBig}
            value={engineRpm / 1000}
            gear={gear}
          />
        </div>

        {/* FuelTemp */}
        <div style={{
          zIndex: 1,
          position: 'relative',
          marginLeft: `-${size * 0.15}px` // overlap 10% into RPM
        }}>
          <FuelTemp
            engineOn={engineOn}
            size={size}
            fuel={fuel}
            fuelCapacity={fuelCapacity}
            temp={temp}
          />
        </div>
      </div>
    </div>
  )
}
