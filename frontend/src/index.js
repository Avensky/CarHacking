import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
// load interface
// import 'inter-ui';
import { useGLTF, useTexture } from '@react-three/drei';

useTexture.preload('/textures/heightmap_1024.png')
useGLTF.preload('/models/track-draco.glb')
useGLTF.preload('/models/chassis-draco.glb')
useGLTF.preload('/models/wheel-draco.glb')

createRoot(document.getElementById('root')).render(<App />);
