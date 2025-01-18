import { FuelTemp } from './FuelTemp'
import { Speed } from './Speed'
import { Rpms } from './Rpms'
import { mutation } from '../../store'
import { useEffect, useState } from 'react'
import { addEffect } from '@react-three/fiber'
import { Boost } from './Boost'

const getSpeed = () => mutation.speed
const getRpms = () => mutation.rpmTarget
const getFuel = () => mutation.fuel
const getTemp = () => mutation.temp
export function Dashboard(physics:any): JSX.Element {
  // console.log('physics: ', physics)
  // console.log('speed: ', carSim.speed)
  // console.log('speed: ', mutation.speed)
  // console.log('rpmTarget: ', mutation.rpmTarget)
  // console.log('rpms: ', carSim.rpms)
  // console.log('fuel: ', carSim.fuel)
  const [speed, setSpeed] = useState(getSpeed())
  const [rpms, setRpms] = useState(getRpms() * 1000)
  const [fuel, setFuel] = useState(getFuel())
  const [temp, setTemp] = useState(getTemp())

  useEffect(() => {
    const unsubscribe = addEffect(() => {
      const newSpeed = getSpeed()
      setSpeed(newSpeed) // Update state instead of props directly
      // console.log("addEffect: ", newSpeed)
      const newRevs = getRpms() * 10
      setRpms(newRevs)
      const newFuel = getFuel()
      setFuel(newFuel)
      const newTemp = getTemp()
      setTemp(newTemp)
    })

    return () => unsubscribe() // Clean up on component unmount
  }, [])

  return (
    <div className="dashboard">
      <div className='dash-top'>
        <Speed speed={physics.velocity} />
        <Rpms rpms={physics.rpmTarget} />
        <FuelTemp fuel={physics.fuel} temp={physics.temp} />
      </div>
      {/* <div className="dash-bottom">
        <Boost />
      </div> */}
    </div>
  )
}
