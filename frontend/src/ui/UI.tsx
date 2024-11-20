// import { Speed } from './Speed'
import { Console } from './console/index'
import Pedals from './Pedals'
// Import necessary types if applicable
interface UIProps {
  cmdEvents: string[]; // Replace `any[]` with the actual type of cmdEvents if known
  isConnected: boolean;
}
export function UI({  cmdEvents, isConnected }: UIProps): JSX.Element {
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
