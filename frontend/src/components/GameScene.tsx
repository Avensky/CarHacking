import { Suspense, useEffect, useMemo, useState } from "react";
import socket from "../socket"; // your client socket setup
import { Environment, OrbitControls, PerspectiveCamera, Sky, Stats, useGLTF } from '@react-three/drei';
import { Box3, DirectionalLight, Layers, Vector3 } from "three";
import { clone } from "lodash-es";
import { Intro } from "../ui/Intro";
import { Canvas } from '@react-three/fiber';
import Camaro from "../models/RaycastVehicle/Camaro";
import Tank from "../models/RaycastVehicle/Tank";
import { HideMouse, Keyboard } from "../controls";
import { Cameras } from "../effects";
import { dpr, levelLayer, useStore } from "../store";
import { Help, Speed, LeaderBoard, PickColor, Editor, Finished, Minimap, Clock } from "../ui";
import { Debug } from "@react-three/cannon";
import { useToggle } from "../useToggle";
import Ae86 from "../models/RaycastVehicle/Ae86";
// import Matrix from "./Matrix";
// import Camaro from '../models/RaycastVehicle/Camaro';
// import Tank from '../models/RaycastVehicle/Tank';

const vehicleMap = {
    ae86: Ae86,
    camaro: Camaro,
    tank: Tank,
};

export default function GameScene({ vehicle: VehicleComponent, map: MapComponent }) {

    const layers = new Layers()
    layers.enable(levelLayer)

    // const [screen, setScreen] = useState<Screen>("vehicle");
    // const [selectedVehicle, setSelectedVehicle] = useState<"ae86" | "camaro" | "tank" | null>(null);
    // const [selectedMap, setSelectedMap] = useState<string | null>(null);
    // const [gameMode, setGameMode] = useState<string | null>(null);
    const [light, setLight] = useState<DirectionalLight | null>(null)
    const [actions, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
    // const { onCheckpoint, onFinish, onStart } = actions
    // const ToggledCheckpoint = useToggle(Checkpoint, 'checkpoint')
    // const ToggledDebug = useToggle(Debug, 'debug')
    // const ToggledEditor = useToggle(Editor, 'editor')
    // const ToggledFinished = useToggle(Finished, 'finished')
    // const ToggledMap = useToggle(Minimap, 'map')
    const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
    // const ToggledStats = useToggle(Stats, 'stats')



    // Calculate ground dimensions
    // useEffect(() => {
    //     const playerId = socket.id;
    //     socket.emit("spawnVehicle", { id: playerId, type: vehicleType });
    //     console.log('vehicleType', vehicleType);
    // }, [vehicleType, mapName, mode]);

    // const renderVehicle = () => {
    //     switch (vehicleType?.toLowerCase()) {
    //         case "ae86":
    //             return <Ae86 />;
    //         case "tank":
    //             return <Tank />;
    //         case "camaro":
    //             return <Camaro />;
    //         default:
    //             return null;
    //     }
    // };


    return (<>
        {/* ✅ R3F 3D UI goes here */}
        <Canvas
            key={`${dpr}${shadows}`}
            dpr={[1, dpr]}
            shadows={shadows}
            camera={{ position: [0, 5, 15], fov: 50 }}
        >
            {/* <Intro> */}
            {/* <fog attach="fog" args={['white', 50, 100]} /> */}
            {/* <color attach="background" args={['#171720']} /> */}
            {/* <Sky sunPosition={[100, 10, 100]} distance={1000} />
            <ambientLight layers={layers} intensity={0.01} />
            <directionalLight
                ref={setLight}
                layers={layers}
                position={[0, 50, 150]}
                intensity={.01}
                shadow-bias={-0.001}
                shadow-mapSize={[4096, 4096]}
                shadow-camera-left={-150}
                shadow-camera-right={150}
                shadow-camera-top={150}
                shadow-camera-bottom={-150}
                castShadow
            /> */}
            <PerspectiveCamera
                makeDefault={editor}
                fov={75}
                position={[0, 20, 20]}
            />
            {/* <ToggledDebug> */}
            <Suspense fallback={null}>
                <VehicleComponent />
                <MapComponent />
            </Suspense >
            {/* </ToggledDebug> */}


            {/* <ToggledMap /> */}
            {/* <ToggledOrbitControls /> */}
            {/* <Clock /> */}
            {/* <ToggledEditor /> */}
            {/* <ToggledFinished /> */}
            {/* <Help /> */}
            {/* <Speed /> */}
            {/* <ToggledStats /> */}
            {/* <ToggledCheckpoint /> */}
            {/* <LeaderBoard /> */}
            {/* <PickColor /> */}
            {/* <HideMouse /> */}

            {/* </Intro > */}
        </Canvas >
    </>
    )
}
