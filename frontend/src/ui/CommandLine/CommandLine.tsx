import { Button } from "./Button/Button";
// import { ConnectionManager } from "./ConnectionManager/ConnectionManager";
import Output from "./Output/Output";
import Input from "./Input/Input";

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
              {/* <Button reload={false} url="/api/start" name="Start Sim" />
              <Button reload={false} url="/api/hack" name="Hack Car" /> */}
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
      <Output events={cmdEvents} />
      <Input />
      {/* <ConnectionManager isConnected={isConnected} /> */}
    </div>
  )
}
