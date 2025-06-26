import { useStore } from '../store'

export function Menu({ onLeaveGame }: { onLeaveGame: () => void }) {
    const [set, menu, screen] = useStore((state) => [state.set, state.menu, state.screen])

    return (
        <div className="help">
            {!menu && <button style={{
                background: 'transparent',
                fontSize: '3rem'
            }}
                onClick={() => set({ menu: true })}>⚙️</button>}
            <div className={`popup ${menu ? 'open' : ''}`}>
                <div className="menu-popup-content">
                    <h2>Game Settings</h2>
                    <button className='settings-button' onClick={() => set({ menu: false })}>Resume Game</button>
                    <button className='settings-button' onClick={() => alert("Change Keybindings - Coming Soon!")}>Change Keybindings</button>
                    {screen === 'game-screen' ? <button className='settings-button' onClick={onLeaveGame}>Leave Game</button> : null}
                </div>
            </div>
        </div>

    )
}
