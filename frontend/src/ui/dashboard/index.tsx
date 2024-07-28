import { FuelTemp } from './FuelTemp/FuelTemp'
import { Speed } from './Speed/Speed'
import { Rpms } from './Rpms/Rpms'

export function Dashboard(carSim: any): JSX.Element {
    console.log('carSim: ', carSim)
    console.log('speed: ', carSim.speed)
    console.log('rpms: ', carSim.rpms)
    console.log('fuel: ', carSim.fuel)
    return (
        <div className='dashboard'>
            {/* <div className='dash-top'>
            </div> */}
            <div className='dash-bottom'>
                <Speed carSim={carSim} />
                <Rpms carSim={carSim} />
                <FuelTemp carSim={carSim} />
            </div>
        </div >
    )
}

