import React, { useMemo, useState } from 'react';
import { Box, Plane } from '@react-three/drei';
import { useStore } from '../store/useStore';

interface InteractiveFaceProps {
  moduleId?: string;
  size: [number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  storedColor?: string;
}

const InteractiveFace: React.FC<InteractiveFaceProps> = ({ moduleId, size, position, rotation, index, storedColor }) => {
  const [hovered, setHovered] = useState(false);
  const selectedColor = useStore(state => state.selectedColor);
  const setModuleFaceColor = useStore(state => state.setModuleFaceColor);

  const isClickable = !!selectedColor && !!moduleId;
  
  // Rules:
  // 1. If storedColor exists -> display it (opacity 1)
  // 2. If hovered -> display hover highlight (opacity 0.4)
  // 3. Otherwise -> invisible
  const color = storedColor || (hovered ? "#facc15" : "#ffffff");
  const opacity = storedColor ? 1 : (hovered ? 0.4 : 0);

  return (
    <Plane
      args={size}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (isClickable) {
          setModuleFaceColor(moduleId, index, selectedColor);
        } else {
          console.log("Face cliquée (sans peinture) : ", index);
        }
      }}
    >
      <meshStandardMaterial
        transparent={true}
        depthWrite={!!storedColor}
        opacity={opacity}
        color={color}
        side={2} // DoubleSide
        metalness={0.1}
        roughness={0.8}
      />
    </Plane>
  );
};

interface ModularBlockProps {
  id?: string;
  type: 'cube' | 'rectangle' | 'plateau';
  position?: [number, number, number];
  color?: string;
  faceColors?: Record<number, string>;
}

const ModularBlock: React.FC<ModularBlockProps> = ({ id, type, position = [0, 0, 0], color = "#ffffff", faceColors = {} }) => {
  const settings = useMemo(() => {
    const thickness = 2.5;
    let width = 40;
    let height = 40;
    let depth = 40;

    if (type === 'rectangle') width = 67;
    if (type === 'plateau') {
      width = 80;
      height = 2.5;
      depth = 80;
    }

    return { width, height, depth, thickness };
  }, [type]);

  const { width, height, depth, thickness } = settings;

  // Frame bars logic
  const bars = useMemo(() => {
    const barsList: { size: [number, number, number]; pos: [number, number, number] }[] = [];

    // 4 Vertical Pillars
    const vPos = [
      [(width - thickness) / 2, 0, (depth - thickness) / 2],
      [-(width - thickness) / 2, 0, (depth - thickness) / 2],
      [(width - thickness) / 2, 0, -(depth - thickness) / 2],
      [-(width - thickness) / 2, 0, -(depth - thickness) / 2],
    ];
    vPos.forEach((pos) => {
      barsList.push({ size: [thickness, height, thickness], pos: pos as [number, number, number] });
    });

    // 4 Horizontal X Bars
    const hXPos = [
      [0, (height - thickness) / 2, (depth - thickness) / 2],
      [0, -(height - thickness) / 2, (depth - thickness) / 2],
      [0, (height - thickness) / 2, -(depth - thickness) / 2],
      [0, -(height - thickness) / 2, -(depth - thickness) / 2],
    ];
    hXPos.forEach((pos) => {
      barsList.push({ size: [width - 2 * thickness, thickness, thickness], pos: pos as [number, number, number] });
    });

    // 4 Horizontal Z Bars
    const hZPos = [
      [(width - thickness) / 2, (height - thickness) / 2, 0],
      [-(width - thickness) / 2, (height - thickness) / 2, 0],
      [(width - thickness) / 2, -(height - thickness) / 2, 0],
      [-(width - thickness) / 2, -(height - thickness) / 2, 0],
    ];
    hZPos.forEach((pos) => {
      barsList.push({ size: [thickness, thickness, depth - 2 * thickness], pos: pos as [number, number, number] });
    });

    return barsList;
  }, [width, height, depth, thickness]);

  // Faces logic
  const faces = useMemo(() => {
    const offset = 0.1;
    const internalW = width - 0.2;
    const internalH = height - 0.2;
    const internalD = depth - 0.2;

    return [
      { size: [internalW, internalD], pos: [0, height / 2 - offset, 0], rot: [-Math.PI / 2, 0, 0] }, // Top (0)
      { size: [internalW, internalD], pos: [0, -height / 2 + offset, 0], rot: [Math.PI / 2, 0, 0] }, // Bottom (1)
      { size: [internalW, internalH], pos: [0, 0, depth / 2 - offset], rot: [0, 0, 0] }, // Front (2)
      { size: [internalW, internalH], pos: [0, 0, -depth / 2 + offset], rot: [0, Math.PI, 0] }, // Back (3)
      { size: [internalD, internalH], pos: [-width / 2 + offset, 0, 0], rot: [0, -Math.PI / 2, 0] }, // Left (4)
      { size: [internalD, internalH], pos: [width / 2 - offset, 0, 0], rot: [0, Math.PI / 2, 0] }, // Right (5)
    ];
  }, [width, height, depth]);

  const frameColor = "#d2b48c"; 

  if (type === 'plateau') {
    return (
      <group position={position}>
        <Box args={[width, height, depth]}>
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
        </Box>
      </group>
    );
  }

  return (
    <group position={position}>
      {bars.map((bar, index) => (
        <Box key={`bar-${index}`} args={bar.size} position={bar.pos}>
          <meshStandardMaterial color={frameColor} metalness={0.2} roughness={0.8} />
        </Box>
      ))}

      {faces.map((face, index) => (
        <InteractiveFace
          key={`face-${index}`}
          moduleId={id}
          index={index}
          size={face.size as [number, number]}
          position={face.pos as [number, number, number]}
          rotation={face.rot as [number, number, number]}
          storedColor={faceColors[index]}
        />
      ))}
    </group>
  );
};

export default ModularBlock;
