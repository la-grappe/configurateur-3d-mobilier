import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';

interface ModularBlockProps {
  type: 'cube' | 'rectangle' | 'plateau';
  position?: [number, number, number];
  color?: string;
}

const ModularBlock: React.FC<ModularBlockProps> = ({ type, position = [0, 0, 0], color = "#ffffff" }) => {
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

  // Render plateau as a simple thin box
  if (type === 'plateau') {
    return (
      <group position={position}>
        <Box args={[width, height, depth]}>
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
        </Box>
      </group>
    );
  }

  // We build the frame with 12 bars to avoid overlapping as much as possible
  // and keep the structure clean.
  const bars = useMemo(() => {
    const barsList: { size: [number, number, number]; pos: [number, number, number] }[] = [];

    // 4 Vertical Pillars (Y-axis)
    // Size: T, H, T
    const vPos = [
      [(width - thickness) / 2, 0, (depth - thickness) / 2],
      [-(width - thickness) / 2, 0, (depth - thickness) / 2],
      [(width - thickness) / 2, 0, -(depth - thickness) / 2],
      [-(width - thickness) / 2, 0, -(depth - thickness) / 2],
    ];
    vPos.forEach((pos) => {
      barsList.push({ size: [thickness, height, thickness], pos: pos as [number, number, number] });
    });

    // 4 Horizontal Bars along X (Top and Bottom)
    // Size: W - 2T, T, T
    const hXPos = [
      [0, (height - thickness) / 2, (depth - thickness) / 2],
      [0, -(height - thickness) / 2, (depth - thickness) / 2],
      [0, (height - thickness) / 2, -(depth - thickness) / 2],
      [0, -(height - thickness) / 2, -(depth - thickness) / 2],
    ];
    hXPos.forEach((pos) => {
      barsList.push({ size: [width - 2 * thickness, thickness, thickness], pos: pos as [number, number, number] });
    });

    // 4 Horizontal Bars along Z (Top and Bottom)
    // Size: T, T, D - 2T
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

  return (
    <group position={position}>
      {bars.map((bar, index) => (
        <Box key={index} args={bar.size} position={bar.pos}>
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
        </Box>
      ))}
      {/* Visual aid for snapping points in next steps could be added here */}
    </group>
  );
};

export default ModularBlock;
