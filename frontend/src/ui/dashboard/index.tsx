import { FuelTemp } from './FuelTemp/FuelTemp'
import { Speed } from './Speed/Speed'
import { Rpms } from './Rpms/Rpms'

export function Dashboard(props: { carSim: { speed: number, rpms: number, fuel: number, temp: number } }): JSX.Element {
    console.log('carSim: ', props.carSim.speed)
    console.log('carSim: ', props.carSim.rpms)
    console.log('carSim: ', props.carSim.fuel)
    return (
        <div className='dashboard'>
            {/* <div className='dash-top'>
            </div> */}
            <div className='dash-bottom'>
                <Speed carSim={props.carSim} />
                <Rpms carSim={props.carSim} />
                <FuelTemp carSim={props.carSim} />
            </div>
        </div >
    )
}

