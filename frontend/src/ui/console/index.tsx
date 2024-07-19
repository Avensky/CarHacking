import { Button } from './Button/Button'
import { ConnectionManager } from './ConnectionManager/ConnectionManager'
import { ConnectionState } from './ConnectionState/ConnectionState'
import { MyForm } from './Terminal/MyForm'
import { Log } from './log/Log'


export function Console(props: { isConnected: boolean, cmdEvents: any }): JSX.Element {

    return <div className='console '>
        <Log events={props.cmdEvents} />
        <ConnectionManager />
        <div className="command">
            <ConnectionState isConnected={props.isConnected} />
            <div>
                <div className="flex-row">
                    <MyForm />
                    {props.isConnected === true
                        ? <>
                            <Button reload={false} url='/api/start' name="Start Sim" />
                            <Button reload={false} url='/api/hack' name="Hack Car" />
                            <Button reload={false} url='/api/reload' name="Reload Node" />
                            <Button reload={true} url='' name="Refresh UI" />
                            <Button reload={false} url='/api/abort' name="Abort" />
                        </>
                        : <>
                            <Button reload={false} url='/api/reload' name="Reload Node" />
                            <Button reload={true} url='' name="Refresh UI" />
                            <Button reload={false} url='/api/vcanAdd' name="Add VCan" />
                            <Button reload={false} url='/api/vcanSetup' name="Setup VCan" />
                        </>
                    }
                </div>
            </div>
        </div>
    </div>


}
