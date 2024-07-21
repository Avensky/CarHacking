import { Dashboard } from './dashboard'
import { Speed } from './Speed'
import { Console } from './console/index'
export function UI(props: { cmdEvents: any, start: object, carEvents: any, isConnected: boolean }): JSX.Element {
    return (
        <div className='overlay'>
            <div className="overlay-left">
                <Console cmdEvents={props.cmdEvents} isConnected={props.isConnected} />
            </div>
            {props.isConnected
                ? <div className="overlay-right">
                    <Speed />
                    <Dashboard events={props.carEvents || props.start} />

                </div> : null
            }
        </div >
    )
}
