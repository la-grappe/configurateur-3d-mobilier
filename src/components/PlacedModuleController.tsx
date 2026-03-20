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
    updateModule, rotateModule, setModuleVertical,
    setSelectedModuleId, selectedModuleId,
    standWidth, standDepth, placedModules, setIsInteracting
  } = useStore();
  const { camera, raycaster, mouse } = useThree();
  const [, setIsDragging] = useState(false); // used only to signal camera-lock
  const meshRef = useRef<THREE.Group>(null);

  const hPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = new THREE.Vector3();

  // ---- Keyboard handlers ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;                        // one action per physical press
      if (selectedModuleId !== module.id) return;  // only act on the selected module

      switch (e.key) {
        case 'r': case 'R':
          if (module.type === 'rectangle' || module.type === 'plateau') {
            rotateModule(module.id);
          }
          break;

        case 'v': case 'V':
          if (module.type === 'rectangle' || module.type === 'plateau') {
            setModuleVertical(module.id);
          }
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
            // Guard: refuse the move if the new position would overlap another module
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
      rotateModule, setModuleVertical, updateModule]);

  // ---- Dragging state ----
  // Drag only starts after the mouse moves > DRAG_THRESHOLD_PX since pointerDown,
  // preventing the module from jumping on a simple click.
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
    // Horizontal plane at Y=0 — surface-drop in calculateSnapping handles the actual height
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
  }, []); // mount/unmount only

  useFrame(() => {
    if (!dragStarted.current) return;

    raycaster.setFromCamera(mouse, camera);

    // Intersect the Y=0 ground plane to get the mouse X,Z world position.
    // calculateSnapping will determine the correct Y via automatic surface-drop.
    if (!raycaster.ray.intersectPlane(hPlane.current, intersectionPoint)) return;
    const targetPos = new THREE.Vector3(intersectionPoint.x, 0, intersectionPoint.z);

    const snapped = calculateSnapping(
      module.type,
      targetPos,
      placedModules,
      standWidth,
      standDepth,
      module.id,
      new THREE.Vector3(...module.position), // collision → freeze in place
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

  // Hit-target bounding box (must match MODULE_SIZES in snapping.ts)
  const hitW = module.type === 'cube' ? 40 : module.type === 'rectangle' ? 67 : 80;
  const hitH = module.type === 'plateau' ? 2.5 : 40;
  const hitD = module.type === 'plateau' ? 80 : 40;

  return (
    <group
      ref={meshRef}
      position={module.position}
      rotation={[module.rotation[0], module.rotation[1], module.rotation[2]]}
      onPointerDown={handlePointerDown}
    >
      <ModularBlock
        type={module.type}
        color={selectedModuleId === module.id ? '#3b82f6' : '#ffffff'}
      />
      {/* Invisible box for easier click-picking */}
      <mesh visible={false}>
        <boxGeometry args={[hitW, hitH, hitD]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default PlacedModuleController;
