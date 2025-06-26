import { useState } from 'react';
import left from '/images/left-arrow.svg'
import right from '/images/right-arrow.svg'
export default function SelectionUI(
    {
        handleVehiclePrev,
        handleVehicleNext,
        handleMapPrev,
        handleMapNext,
        vehicleName,
        mapName,
        handleSpawn
    }: {
        handleVehiclePrev: any,
        handleVehicleNext: any,
        handleMapPrev: any,
        handleMapNext: any,
        vehicleName: string,
        mapName: string,
        handleSpawn: any
    }) {
    const [clickedBtn, setClickedBtn] = useState<string | null>(null);

    function animateButton(id: string, callback: () => void) {
        setClickedBtn(id);
        callback();
        setTimeout(() => setClickedBtn(null), 300);
    }
    return (
        <div
            style={{
                position: 'absolute', // ✅ Changed
                pointerEvents: 'auto', // ✅ Ensures buttons work
                bottom: '5%',
                left: '50%',
                userSelect: 'none',
                textAlign: 'center',
                transform: 'translateX(-50%)',
                color: 'white',
            }}>
            {/* UI controls fixed on screen */}
            {/* <h2>{selectedVehicle.name}</h2> */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button

                    onContextMenu={(e) => e.preventDefault()}
                    className={`selection ${clickedBtn === 'vehiclePrev' ? 'clicked' : ''}`}
                    style={{ backgroundImage: `url(${left})` }}
                    onClick={() => animateButton('vehiclePrev', handleVehiclePrev)}

                />
                <span style={{ margin: '0 1rem', width: 100, fontWeight: 700 }}>{vehicleName}</span>
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`selection ${clickedBtn === 'vehicleNext' ? 'clicked' : ''}`}
                    style={{ backgroundImage: `url(${right})` }}
                    onClick={() => animateButton('vehicleNext', handleVehicleNext)}

                />
            </div>

            {/* <h3 style={{ marginTop: '2rem' }}>{selectedMap.name}</h3> */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`selection ${clickedBtn === 'mapPrev' ? 'clicked' : ''}`}
                    style={{ backgroundImage: `url(${left})` }}
                    onClick={() => animateButton('mapPrev', handleMapPrev)}

                />
                <span style={{ margin: '0 1rem', width: 100, fontWeight: 700 }}>{mapName}</span>
                <button
                    onContextMenu={(e) => e.preventDefault()}
                    className={`selection ${clickedBtn === 'mapNext' ? 'clicked' : ''}`}
                    style={{ backgroundImage: `url(${right})` }}
                    onClick={() => animateButton('mapNext', handleMapNext)}
                />
            </div>
            <button
                className={`selection ${clickedBtn === 'spawn' ? 'clicked' : ''}`}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                    marginTop: 20,
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    width: '100%',
                    borderRadius: '16px',
                }}
                onClick={() => animateButton('spawn', handleSpawn)}
            >
                Start Game
            </button>
        </div>
    );
}
