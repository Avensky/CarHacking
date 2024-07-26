import { Button } from './Button/Button'
import { ConnectionManager } from './ConnectionManager/ConnectionManager'
import { MyForm } from './Terminal/MyForm'
import { Log } from './log/Log'


export function Console(props: { isConnected: boolean, cmdEvents: any }): JSX.Element {

    return <div className='console '>
        <Log events={props.cmdEvents} />
        <ConnectionManager isConnected={props.isConnected} />
        <div className="command">
            <div>
                <div className="flex-row">
                    <MyForm />
                    {props.isConnected === true
                        ? <>
                            <Button reload={false} url='/api/start' name="Start Sim" />
                            <Button reload={false} url='/api/hack' name="Hack Car" />
                            <Button reload={false} url='/api/reload' name="Reload Node" />
                            <Button reload={true} url='' name="Reload UI" />
                            <Button reload={false} url='/api/abort' name="Abort" />
                            <Button reload={false} url='/api/ping' name="Ping" />
                        </>
                        : <>
                            <Button reload={false} url='/api/reload' name="Reload Node" />
                            <Button reload={true} url='' name="Refresh UI" />
                        </>
                    }
                </div>
            </div>
        </div>
    </div>


}
