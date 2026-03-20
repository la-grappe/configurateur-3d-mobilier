import React from 'react';
import { Grid, Plane } from '@react-three/drei';
import { useStore } from '../store/useStore';

const Stand: React.FC = () => {
  const standWidth = useStore((state) => state.standWidth);
  const standDepth = useStore((state) => state.standDepth);

  return (
    <group>
      {/* The Floor Grid */}
      <Grid
        args={[standWidth, standDepth]}
        sectionSize={40} // Base module size
        sectionColor="#3b82f6"
        sectionThickness={1.5}
        cellSize={10}
        cellColor="#444444"
        cellThickness={0.5}
        infiniteGrid={false}
        fadeDistance={1000}
        fadeStrength={5}
        position={[0, -0.01, 0]}
      />
      
      {/* Solid Floor Area */}
      <Plane args={[standWidth, standDepth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#111111" transparent opacity={0.6} />
      </Plane>
      
      {/* Origin Marker */}
      <axesHelper args={[50]} />
    </group>
  );
};

export default Stand;
