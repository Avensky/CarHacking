import { createRoot } from 'react-dom/client';
import { useGLTF } from '@react-three/drei';
import 'inter-ui';
import './styles.css';
import { App } from './App';

// Preload 3D models
useGLTF.preload('/models/ccity_building_set_1.glb');
useGLTF.preload('/models/track-draco.glb');
useGLTF.preload('/models/chassis-draco.glb');
useGLTF.preload('/models/wheel-draco.glb');

// Render the React app
createRoot(document.getElementById('root')!).render(<App />);

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {

    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered: ', registration);
        })
        .catch((registrationError) => {
          console.error('Service Worker registration failed: ', registrationError);
        });
    }

  });
}