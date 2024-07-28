import { Dashboard } from './dashboard'
import { Speed } from './Speed'
import { Console } from './console/index'
export function UI(props: { cmdEvents: any, carSim: { speed: number, fuel: number, rmps: number }, isConnected: boolean }): JSX.Element {
    return (
        <div className='overlay'>
            <div className="overlay-left">
                <Console cmdEvents={props.cmdEvents} isConnected={props.isConnected} />
            </div>
            {props.isConnected
                ? <div className="overlay-right">
                    <Speed />
                    <Dashboard carSim={props.carSim} />

                </div> : null
            }
        </div >
    )
}
