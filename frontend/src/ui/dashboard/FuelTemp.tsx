// import Speedometer, {
//   Background,
//   Arc,
//   Needle,
//   // Progress,
//   Marks,
//   // Indicator,
//   DangerPath,
// } from 'react-speedometer'
import FuelGauge from './FuelGauge'
import TempGauge from './TempGauge'

interface FuelTempProps {
  fuel: number // Expect fuel as a number
  temp: number // Expect temp as a number
  fuelCapacity: number
  size: number
  engineOn: boolean
}
// export function FuelTemp({ fuel, temp }: FuelTempProps): JSX.Element {
export default function FuelTemp({ fuel, temp, fuelCapacity, size, engineOn }: FuelTempProps): JSX.Element {
  // console.log('Fuel', fuel)
  // console.log('FuelCapacity', fuelCapacity)

  // Ensure values are valid and within expected ranges
  // const safeFuel = isNaN(fuel) ? 0 : fuel;
  // const safeTemp = isNaN(temp) ? 100 : temp;

  // const clampedFuel = Math.max(-500, Math.min(0, safeFuel * -1));
  // const clampedTemp = Math.max(100, Math.min(280, safeTemp));
  return (

    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.7)',
      }}>
      <div
        style={{
          position: 'relative',
          top: '3%', // shift up to stick to top
          right: '-18%',
        }}
      >
        <FuelGauge
          fuel={fuel}
          fuelCapacity={fuelCapacity}
          scale={size * .75}
          engineOn={engineOn}
        />
      </div>
      <div
        style={{
          position: 'relative',
          bottom: '-22%', // shift up to stick to top
          right: '-18%',
        }}
      >
        <TempGauge
          temp={temp}
          minTemp={160}
          maxTemp={250}
          overheat={240}
          critical={260}
          scale={size * .75}
          engineOn={engineOn}
        />
      </div>
    </div>
  )
}
