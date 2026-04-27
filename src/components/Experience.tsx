import React, { useRef, useEffect } from 'react';
import { CameraControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { useStore } from '../store/useStore';
import Stand from './Stand';
import DragLayer from './DragLayer';
import PlacedModuleController from './PlacedModuleController';

const Experience: React.FC = () => {
  const cameraView = useStore((state) => state.cameraView);
  const placedModules = useStore((state) => state.placedModules);
  const isInteracting = useStore((state) => state.isInteracting);
  const theme = useStore((state) => state.theme);
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    
    switch (cameraView) {
      case 'top':
        controls.setLookAt(0, 500, 0, 0, 0, 0, true);
        break;
      case 'front':
        controls.setLookAt(0, 100, 500, 0, 0, 0, true);
        break;
      case 'left':
        controls.setLookAt(-500, 100, 0, 0, 0, 0, true);
        break;
      case 'right':
        controls.setLookAt(500, 100, 0, 0, 0, 0, true);
        break;
      case 'iso':
        controls.setLookAt(300, 300, 300, 0, 0, 0, true);
        break;
      default:
        break;
    }
  }, [cameraView]);

  return (
    <>
      <color attach="background" args={[theme === 'dark' ? '#0f172a' : '#f1f5f9']} />
      
      <PerspectiveCamera makeDefault position={[300, 300, 300]} fov={50} />
      <CameraControls 
        ref={controlsRef} 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.75}
        enabled={!isInteracting}
      />

      <ambientLight intensity={theme === 'dark' ? 0.5 : 0.8} />
      <directionalLight position={[100, 200, 100]} intensity={1.5} castShadow />
      <pointLight position={[-100, 200, -100]} intensity={1} />

      <Environment preset="city" />

      <Stand />

      {/* Dynamic Placed Modules */}
      {placedModules.map((module) => (
        <PlacedModuleController 
          key={module.id} 
          module={module} 
        />
      ))}

      {/* Drag & Drop Feedback Layer */}
      <DragLayer />

      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={1000} 
        blur={2} 
        far={10} 
        resolution={128} 
        color="#000000" 
      />
    </>
  );
};

export default Experience;
