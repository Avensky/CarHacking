import { Button } from './Button/Button'
import { ConnectionManager } from './ConnectionManager/ConnectionManager'
import { MyForm } from './Terminal/MyForm'
import { Log } from './log/Log'

export function Console(props: { isConnected: boolean; cmdEvents: any }): JSX.Element {

  return (
    <div className="console ">
      <Log events={props.cmdEvents} />
      <ConnectionManager isConnected={props.isConnected} />
      <div className="command">
        <div>
          <div className="flex-row">
            <MyForm />
            {props.isConnected === true ? (
              <>
                <Button reload={false} url="/api/start" name="Start Sim" abort={false}/>
                <Button reload={false} url="/api/hack" name="Hack Car" abort={false}/>
                <Button reload={false} url="/api/reload" name="Reload Node" abort={false}/>
                <Button reload={true} url="" name="Reload UI" abort={false}/>
                <Button reload={false} url="/api/abort" name="Abort" abort={true}/>
                {/* <Button reload={false} url='/api/ping' name="Ping" /> */}
              </>
            ) : (
              <>
                <Button reload={false} url="/api/reload" name="Reload Node" abort={false}/>
                <Button reload={true} url="" name="Refresh UI" abort={false}/>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
