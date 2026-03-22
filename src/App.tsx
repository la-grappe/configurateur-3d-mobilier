import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import UI from './components/UI';
import { useStore } from './store/useStore';
import './App.css';

function App() {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="canvas-container">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <UI />
    </div>
  );
}

export default App;
