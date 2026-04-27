import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import UI from './components/UI';
import HelpOverlay from './components/HelpOverlay';
import { useStore } from './store/useStore';
import './App.css';

function App() {
 const theme = useStore((state) => state.theme);
 const setShowHelp = useStore((state) => state.setShowHelp);
 const undo = useStore((state) => state.undo);
 const redo = useStore((state) => state.redo);

 useEffect(() => {
  if (theme === 'dark') {
   document.documentElement.classList.add('dark');
  } else {
   document.documentElement.classList.remove('dark');
  }
 }, [theme]);

 // Keyboard shortcuts
 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   // Toggle help with '?'
   if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    setShowHelp(true);
   }
   // Undo: Ctrl+Z
   if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
   }
   // Redo: Ctrl+Y or Ctrl+Shift+Z
   if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
    e.preventDefault();
    redo();
   }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
 }, [setShowHelp, undo, redo]);

 return (
  <div className="canvas-container">
  <Canvas shadows>
  <Suspense fallback={null}>
  <Experience />
  </Suspense>
  </Canvas>
  <UI />
  <HelpOverlay />
  </div>
 );
}

export default App;
