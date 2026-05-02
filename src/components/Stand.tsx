import React from 'react';
import { Plane } from '@react-three/drei';
import { useStore } from '../store';

const Stand: React.FC = () => {
  const standWidth = useStore((state) => state.standWidth);
  const standDepth = useStore((state) => state.standDepth);
  const theme = useStore((state) => state.theme);

  return (
    <group>
      {/* The Floor Grid */}
      <gridHelper
        args={[
          Math.max(standWidth, standDepth),
          10,
          theme === 'dark' ? '#334155' : '#cbd5e1',
          theme === 'dark' ? '#1e293b' : '#e2e8f0'
        ]}
        position={[0, 0.01, 0]}
      />

      {/* Solid Floor Area */}
      <Plane args={[standWidth, standDepth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color={theme === 'dark' ? "#111111" : "#ffffff"} transparent opacity={theme === 'dark' ? 0.6 : 0.4} />
      </Plane>

      {/* Origin Marker */}
      <axesHelper args={[50]} />
    </group>
  );
};

export default Stand;
