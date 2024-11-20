// import { Speed } from './Speed'
import { Console } from './console/index'
import Pedals from './Pedals'

export function UI({ cmdEvents, isConnected }): JSX.Element {
  return (
    <div className="overlay">
      <div className="overlay-left">
        <Console cmdEvents={cmdEvents} isConnected={isConnected} />
      </div>
      <div className="overlay-right">
        <Pedals />
      </div>
    </div>
  )
}
