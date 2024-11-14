import { Dashboard } from './dashboard/Dashboard'
import { Speed } from './Speed'
import { Console } from './console/index'

export function UI({ cmdEvents, isConnected }): JSX.Element {
  return (
    <div className="overlay">
      <div className="overlay-left">
        <Console cmdEvents={cmdEvents} isConnected={isConnected} />
      </div>
      <div className="overlay-right">
        <Speed />
        <Dashboard />
      </div>
    </div>
  )
}
