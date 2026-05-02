import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { PlacedModule } from '../store/useStore';
import { useStore } from '../store/useStore';
import { calculateSnapping, stepModuleUp, stepModuleDown, hasCollisionAtPosition } from '../utils/snapping';
import ModularBlock from './ModularBlock';
import * as THREE from 'three';

interface PlacedModuleControllerProps {
  module: PlacedModule;
}

const PlacedModuleController: React.FC<PlacedModuleControllerProps> = ({ module }) => {
  const {
    updateModule, rotateModule, setModuleVertical, removeModule,
    setSelectedModuleId, selectedModuleId,
    standWidth, standDepth, placedModules, setIsInteracting
  } = useStore();
  const { camera, raycaster, mouse } = useThree();
  const [, setIsDragging] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const hPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = new THREE.Vector3();

  // ---- Keyboard handlers ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (selectedModuleId !== module.id) return;

      switch (e.key) {
        case 'r': case 'R': {
          rotateModule(module.id);
          break;
        }

        case 'v': case 'V':
          if (module.type === 'rectangle' || module.type === 'plateau') {
            setModuleVertical(module.id);
          }
          break;

        case 'Delete':
        case 'Backspace':
          removeModule(module.id);
          setSelectedModuleId(null);
          break;

        case 'h': case 'H': {
          const newY = stepModuleUp(module.type, module.rotation, module.position[1]);
          if (newY !== module.position[1]) {
            updateModule(module.id, [module.position[0], newY, module.position[2]]);
          }
          break;
        }

        case 'b': case 'B': {
          const newY = stepModuleDown(module.type, module.rotation, module.position[1]);
          if (newY !== module.position[1]) {
            const wouldCollide = hasCollisionAtPosition(
              module.type,
              [module.position[0], newY, module.position[2]],
              placedModules,
              module.id,
              module.rotation
            );
            if (!wouldCollide) {
              updateModule(module.id, [module.position[0], newY, module.position[2]]);
            }
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModuleId, module.id, module.type, module.position, placedModules,
    rotateModule, setModuleVertical, updateModule, standWidth, standDepth]);

  // ---- Dragging state ----
  const DRAG_THRESHOLD_PX = 4;
  const pointerIsDown = useRef(false);
  const dragStarted = useRef(false);
  const pointerDownScreenPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setSelectedModuleId(module.id);
    setIsInteracting(true);
    pointerIsDown.current = true;
    dragStarted.current = false;
    pointerDownScreenPos.current = { x: e.clientX, y: e.clientY };
    hPlane.current.constant = 0;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pointerIsDown.current || dragStarted.current) return;
      const dx = e.clientX - pointerDownScreenPos.current.x;
      const dy = e.clientY - pointerDownScreenPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) {
        dragStarted.current = true;
        setIsDragging(true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (!dragStarted.current) return;

    raycaster.setFromCamera(mouse, camera);

    if (!raycaster.ray.intersectPlane(hPlane.current, intersectionPoint)) return;
    const targetPos = new THREE.Vector3(intersectionPoint.x, 0, intersectionPoint.z);

    const snapped = calculateSnapping(
      module.type,
      targetPos,
      placedModules,
      standWidth,
      standDepth,
      module.id,
      new THREE.Vector3(...module.position),
      module.rotation
    );

    if (
      snapped.x !== module.position[0] ||
      snapped.y !== module.position[1] ||
      snapped.z !== module.position[2]
    ) {
      updateModule(module.id, [snapped.x, snapped.y, snapped.z]);
    }
  });

  useEffect(() => {
    const handleMouseUp = () => {
      if (pointerIsDown.current) {
        pointerIsDown.current = false;
        dragStarted.current = false;
        setIsDragging(false);
        setIsInteracting(false);
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const size = {
    cube: { width: 40, height: 40, depth: 40 },
    rectangle: { width: 67, height: 40, depth: 40 },
    plateau: { width: 80, height: 2.5, depth: 80 },
  }[module.type];

  // 🔍 GUARD: Check for invalid Y position
  const rotDeg = (module.rotation[1] * 180 / Math.PI).toFixed(1);
  if (module.position[1] < 0) {
    console.warn(`⚠️ INVALID Y - Module ${module.id}: Y=${module.position[1].toFixed(2)} at RotY=${rotDeg}°`);
    // Attempt to fix by resetting Y to minimum safe value
    const minY = size.height / 2;
    updateModule(module.id, [module.position[0], minY, module.position[2]]);
    return null;
  }

  if (!isFinite(module.position[1])) {
    console.error(`❌ NaN Y - Module ${module.id}: Y=${module.position[1]}`);
    removeModule(module.id);
    return null;
  }

  return (
    <group
      ref={meshRef}
      position={module.position}
      rotation={new THREE.Euler(module.rotation[0], module.rotation[1], module.rotation[2], 'YXZ')}
      onPointerDown={handlePointerDown}
    >
      <ModularBlock
        id={module.id}
        type={module.type}
        color="#ffffff"
        faceColors={module.faceColors}
      />
      <mesh visible={false}>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default PlacedModuleController;