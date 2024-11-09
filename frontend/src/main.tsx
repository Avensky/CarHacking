import { createRoot } from 'react-dom/client'
// import React from "react";
// import { insertCoin } from "playroomkit";
// import { useGLTF, useTexture } from '@react-three/drei'
import 'inter-ui'
import './styles.css'
import {App }from './App';

// useGLTF.preload('/')
// useTexture.preload('/textures/heightmap_1024.png')
// useGLTF.preload('/models/track-draco.glb')
// useGLTF.preload('/models/chassis-draco.glb')
// useGLTF.preload('/models/wheel-draco.glb')

// insertCoin({
//     skipLobby: true,
//   }).then(() =>
//     createRoot(document.getElementById('root')!).render(<App />)
//   );

createRoot(document.getElementById('root')!).render(<App />)