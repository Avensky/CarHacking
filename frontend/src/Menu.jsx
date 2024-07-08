import { useMultiplayerState } from "playroomkit";
// import { Game } from "./Game";
import { Lobby } from "./Lobby";

export const Menu = () => {
    const [gameState] = useMultiplayerState("gameState", "lobby");
    return (
        <>
            {gameState === "lobby" && <Lobby />}
            {/* {gameState === "game" && <Game />} */}
        </>
    );
};