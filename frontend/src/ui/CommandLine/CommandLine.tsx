import { Button } from "./Button/Button";
import { ConnectionManager } from "./ConnectionManager/ConnectionManager";
import { Log } from "./log/Log";
import { MyForm } from "./Terminal/MyForm";

interface UIProps {
  cmdEvents: string[]; // Replace `any[]` with the actual type of cmdEvents if known
  isConnected: boolean;
}
export default function CommandLine({ cmdEvents, isConnected }: UIProps): JSX.Element {
  return (
    <div className="command-line">
      <div className="command">
        <div className="flex-row">
          {isConnected === true ? (
            <>
              <Button reload={false} url="/api/start" name="Start Sim" />
              <Button reload={false} url="/api/hack" name="Hack Car" />
              <Button reload={false} url="/api/reload" name="Reload Node" />
              <Button reload={true} url="" name="Reload UI" />
              <Button reload={false} url="/api/abort" name="Abort" />
              {/* <Button reload={false} url='/api/ping' name="Ping" /> */}
            </>
          ) : (
            <>
              <Button reload={false} url="/api/reload" name="Reload Node" />
              <Button reload={true} url="" name="Refresh UI" />
            </>
          )}
        </div>
      </div>
      <Log events={cmdEvents} />
      <MyForm />
      <ConnectionManager isConnected={isConnected} />
    </div>
  )
}
