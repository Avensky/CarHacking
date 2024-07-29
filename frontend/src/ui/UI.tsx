import { Dashboard } from './dashboard'
import { Speed } from './Speed'
import { Console } from './console/index'
export function UI({ cmdEvents, isConnected, carSim }): JSX.Element {
    // const start = { speed: 0, rpms: 0, fuel: 0, temp: 0 }

    console.log('UI: ', carSim);
    return (
        <div className='overlay'>
            <div className="overlay-left">
                <Console cmdEvents={cmdEvents} isConnected={isConnected} />
            </div>
            {isConnected
                ? <div className="overlay-right">
                    <Speed />
                    <Dashboard {...carSim} />

                </div> : null
            }
        </div >
    )
}
