import { FuelTemp } from './FuelTemp/FuelTemp'
import { Speed } from './Speed/Speed'
import { Rpms } from './Rpms/Rpms'

export function Dashboard(events: any): JSX.Element {
    return (
        <div className='dashboard'>
            <div className='dash-top'>
                <FuelTemp events={events} />
            </div>
            <div className='dash-bottom'>
                <Speed events={events} />
                <Rpms events={events} />
            </div>
        </div >
    )
}

