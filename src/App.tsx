import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from './components/Experience';
import UI from './components/UI';
import './App.css';

function App() {
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
