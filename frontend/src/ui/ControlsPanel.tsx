import React from 'react';
import { useStore } from '../store';
import socket from '../socket';
import onOff from '/images/onOff.svg'
import headlights from '/images/headlights.svg'
import left from '/images/left.svg'
import right from '/images/right.svg'
import hazard from '/images/hazard.svg'
import horn from '/images/hornCurve.svg'
import nos from '/images/nos.svg'
import soundOn from '/images/soundOn.svg'
import soundOff from '/images/soundOff.svg'
import reset from '/images/reset.svg'

function ControlsPanel(): JSX.Element {
    const controls = useStore((s) => s.controls);
    const setControls = useStore((s) => s.setControls);
    const [set, sound] = useStore((state) => [state.set, state.sound])

    const toggleControl = (key: keyof typeof controls) => {
        const nextControls = { ...controls, [key]: !controls[key] };
        setControls(nextControls);
        socket.emit('controls', { ...nextControls });
    };

    return (
        <div className="ControlsPanel">
            <div className="row">
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.reset ? 'pulse' : ''}`}
                    style={{ backgroundImage: `url(${reset})` }}
                    onPointerDown={() => {
                        const nextControls = { ...controls, reset: true };
                        setControls(nextControls);
                        socket.emit('controls', { ...nextControls });
                    }}
                    onPointerUp={() => {
                        const nextControls = { ...controls, reset: false };
                        setControls(nextControls);
                        socket.emit('controls', { ...nextControls });
                    }}
                    onPointerLeave={() => {
                        if (controls.reset) {
                            const nextControls = { ...controls, reset: false };
                            setControls(nextControls);
                            socket.emit('controls', { ...nextControls });
                        }
                    }}
                    onPointerCancel={() => {
                        if (controls.reset) {
                            const nextControls = { ...controls, reset: false };
                            setControls(nextControls);
                            socket.emit('controls', { ...nextControls });
                        }
                    }}
                />
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${sound ? 'headlight' : ''}`}
                    style={{ backgroundImage: `url(${sound ? soundOn : soundOff})` }}
                    onClick={() => set({ sound: !sound })}
                />
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.headlights ? 'headlight' : ''}`}
                    style={{ backgroundImage: `url(${headlights})` }}
                    onClick={() => toggleControl('headlights')} />
            </div>
            <div className="row">
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.blinkerLeft ? 'flash' : ''}`}
                    style={{ backgroundImage: `url(${left})` }}

                    onClick={() => toggleControl('blinkerLeft')}
                />
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.hazards ? 'flash' : ''}`}
                    style={{ backgroundImage: `url(${hazard})` }}
                    onClick={() => toggleControl('hazards')}
                />
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.blinkerRight ? 'flash' : ''}`}
                    style={{ backgroundImage: `url(${right})` }}
                    onClick={() => toggleControl('blinkerRight')}
                />
            </div>
            <div className="row">

                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.honk ? 'pulse' : ''}`}
                    style={{ backgroundImage: `url(${horn})` }}
                    onPointerDown={() => {
                        const nextControls = { ...controls, honk: true };
                        setControls(nextControls);
                        socket.emit('controls', { ...nextControls });
                    }}
                    onPointerUp={() => {
                        const nextControls = { ...controls, honk: false };
                        setControls(nextControls);
                        socket.emit('controls', { ...nextControls });
                    }}
                    onPointerLeave={() => {
                        if (controls.honk) {
                            const nextControls = { ...controls, honk: false };
                            setControls(nextControls);
                            socket.emit('controls', { ...nextControls });
                        }
                    }}
                    onPointerCancel={() => {
                        if (controls.honk) {
                            const nextControls = { ...controls, honk: false };
                            setControls(nextControls);
                            socket.emit('controls', { ...nextControls });
                        }
                    }}
                />
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.boost ? 'boost' : ''}`}
                    style={{ backgroundImage: `url(${nos})` }}
                    onClick={() => toggleControl('boost')}
                />
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`control ${controls.engineOn ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${onOff})` }}
                    onClick={() => toggleControl('engineOn')} />


            </div>
        </div>
    );
}

export default ControlsPanel;
