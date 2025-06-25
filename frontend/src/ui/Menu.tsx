import { useStore } from '../store'

export function Menu({ onLeaveGame }: { onLeaveGame: () => void }) {
    const [set, menu, sound] = useStore((state) => [state.set, state.menu, state.sound])

    return (
        <>
            <div className={`${sound ? 'sound' : 'nosound'}`}></div>
            <div className="help">
                {!menu && <button style={{
                    background: 'transparent',
                    fontSize: '1.7rem'
                }}
                    onClick={() => set({ menu: true })}>⚙️</button>}
                <div className={`popup ${menu ? 'open' : ''}`}>
                    <div className="menu-popup-content">
                        <h2>Game Settings</h2>
                        <button className='settings-button' onClick={() => set({ menu: false })}>Resume Game</button>
                        <button className='settings-button' onClick={() => alert("Change Keybindings - Coming Soon!")}>Change Keybindings</button>
                        <button className='settings-button' onClick={onLeaveGame}>Leave Game</button>
                    </div>
                </div>
            </div>
        </>
    )
}
