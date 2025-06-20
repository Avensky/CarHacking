
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
                <button onClick={handleVehiclePrev}>←</button>
                <span style={{ margin: '0 1rem', width: 100, fontWeight: 700 }}>{vehicleName}</span>
                <button onClick={handleVehicleNext}>→</button>
            </div>

            {/* <h3 style={{ marginTop: '2rem' }}>{selectedMap.name}</h3> */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={handleMapPrev}>←</button>
                <span style={{ margin: '0 1rem', width: 100, fontWeight: 700 }}>{mapName}</span>
                <button onClick={handleMapNext}>→</button>
            </div>
            <button onClick={handleSpawn} style={{ marginTop: 20 }}>Start Game</button>
        </div>
    );
}
