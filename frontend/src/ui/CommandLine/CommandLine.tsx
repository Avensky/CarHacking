import { useEffect, useState, useRef } from "react";
import Output from "./Output/Output";
import Input from "./Input/Input";
import play from "/images/play.svg";
import pause from "/images/pause.svg";
import clear from "/images/clear2.svg";
import reload from '/images/reload.svg'
import { useStore } from "../../store";

interface UIProps {
  cmdEvents: string[]; // Replace `any[]` with the actual type of cmdEvents if known
}

export default function CommandLine({ cmdEvents }: UIProps): JSX.Element {
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [set, cli] = useStore((state) => [state.set, state.cli])
  const [clearInputFlag, setClearInputFlag] = useState(false);
  // Keep logs updated only when not paused
  useEffect(() => {
    if (!paused) {
      setLogs(cmdEvents);
    }
  }, [cmdEvents, paused]);

  return (
    <div
      style={{
        pointerEvents: cli ? 'auto' : 'none',
      }}
      className={`command-line popup-left ${cli ? 'open' : ''}`}
    >
      <div className="command">
        <div className="cmd-controls">
          <div className="cmd-controls-left">
            <button
              className={`cmd-control`}
              onClick={() => setPaused(!paused)}
              style={{ backgroundImage: `url(${paused ? play : pause})` }}
            />
            <button
              className={`cmd-control reload`}
              style={{ backgroundImage: `url(${reload})` }}
              onClick={() => {
                setLogs([]);
                setClearInputFlag(true);   // ✅ tell input to clear
              }}
            />
          </div>
          <div className="cmd-controls-right">
            <button
              className={`cmd-control clear`}
              style={{ backgroundImage: `url(${clear})` }}
              onClick={() => set({ cli: false })}
            />
          </div>
        </div>
      </div>
      <Output paused={paused} logs={logs} events={cmdEvents} cli={cli} />
      <Input clearInputFlag={clearInputFlag} setClearInputFlag={setClearInputFlag} />
    </div>
  )
}
