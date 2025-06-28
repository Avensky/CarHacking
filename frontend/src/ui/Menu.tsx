import { useStore } from '../store'

export function Menu({ onLeaveGame }: { onLeaveGame: () => void }) {
    const [set, menu, cli, help, screen] = useStore((state) => [
        state.set, state.menu, state.cli, state.help, state.screen
    ])

    return (
        <div className="help">
            <div className={`popup ${menu ? 'open' : ''}`}>
                <div className="menu-popup-content">
                    <h2>Game Settings</h2>
                    <button className='settings-button' onClick={() => set({ menu: false })}>Resume Game</button>
                    <button className='settings-button' onClick={() => set({ cli: true, menu: false })}>Command Line Logs</button>
                    <button className='settings-button' onClick={() => set({ help: true, menu: false })}>Keybindings</button>
                    {screen === 'game-screen' ? <button className='settings-button' onClick={onLeaveGame}>Leave Game</button> : null}
                </div>
            </div>
        </div>

    )
}
