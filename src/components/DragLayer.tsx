import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { calculateSnapping } from '../utils/snapping';
import ModularBlock from './ModularBlock';

const DragLayer: React.FC = () => {
  const {
    draggingModule,
    setDraggingModule,
    addModule,
    placedModules,
    standWidth,
    standDepth,
    setIsInteracting
  } = useStore();
  const { camera, raycaster, mouse } = useThree();
  const [position, setPosition] = useState<THREE.Vector3 | null>(null);
  const [dragStartedIntoScene, setDragStartedIntoScene] = useState(false);
  const initialMousePos = useRef<{ x: number, y: number } | null>(null);
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = new THREE.Vector3();

  useEffect(() => {
    if (draggingModule) setIsInteracting(true);
  }, [draggingModule, setIsInteracting]);

  // Tracks the last position that did NOT cause a collision.
  // Passed to calculateSnapping as the fallback — blocks ghost from passing through modules.
  const lastValidPos = useRef<THREE.Vector3 | null>(null);

  useFrame(() => {
    if (!draggingModule) {
      if (position) setPosition(null);
      lastValidPos.current = null;
      initialMousePos.current = null;
      if (dragStartedIntoScene) setDragStartedIntoScene(false);
      return;
    }

    if (!initialMousePos.current) {
      initialMousePos.current = { x: mouse.x, y: mouse.y };
    }

    // Seuil de détection du drag (en coordonnées normalisées -1 à 1)
    const dist = Math.sqrt(Math.pow(mouse.x - initialMousePos.current.x, 2) + Math.pow(mouse.y - initialMousePos.current.y, 2));
    if (!dragStartedIntoScene && dist > 0.05) {
      setDragStartedIntoScene(true);
    }

    raycaster.setFromCamera(mouse, camera);
    if (raycaster.ray.intersectPlane(planeRef.current, intersectionPoint)) {
      // Si on n'a pas encore bougé la souris (Simple clic), on force le centre (0,0,0)
      const rawPos = dragStartedIntoScene
        ? new THREE.Vector3(intersectionPoint.x, 0, intersectionPoint.z)
        : new THREE.Vector3(0, 0, 0);

      const snapped = calculateSnapping(
        draggingModule,
        rawPos,
        placedModules,
        standWidth,
        standDepth,
        undefined,
        lastValidPos.current ?? undefined
      );

      // If snapped equals lastValidPos, calculateSnapping rejected the move (collision).
      // Don't update lastValidPos — the ghost stays frozen.
      const isBlocked = lastValidPos.current && snapped.equals(lastValidPos.current);
      if (!isBlocked) {
        lastValidPos.current = snapped.clone();
      }

      if (!position || !snapped.equals(position)) {
        setPosition(snapped);
      }
    }
  });

  useEffect(() => {
    const handleMouseUp = () => {
      if (draggingModule) {
        if (position) {
          addModule({
            id: Math.random().toString(36).substr(2, 9),
            type: draggingModule,
            position: [position.x, position.y, position.z],
            rotation: [0, 0, 0],
          });
        }
        setDraggingModule(null);
        setIsInteracting(false);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [draggingModule, position, addModule, setDraggingModule]);

  if (!draggingModule || !position) return null;

  // Ghost dimensions — must match MODULE_SIZES in snapping.ts
  const ghostW = draggingModule === 'cube' ? 40 : draggingModule === 'rectangle' ? 67 : 80;
  const ghostH = draggingModule === 'plateau' ? 2.5 : 40;
  const ghostD = draggingModule === 'plateau' ? 80 : 40;

  return (
    <group position={[position.x, position.y, position.z]}>
      <ModularBlock type={draggingModule} />
      {/* Ghost effect */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <boxGeometry args={[ghostW, ghostH, ghostD]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default DragLayer;
