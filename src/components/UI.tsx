import React from 'react';
import { useStore } from '../store/useStore';
import { Maximize, Box, Camera } from 'lucide-react';

const UI: React.FC = () => {
  const { 
    standWidth, 
    standDepth, 
    setStandSize, 
    cameraView, 
    setCameraView,
    draggingModule,
    setDraggingModule
  } = useStore();

  return (
    <div className="ui-overlay">
      <div className="top-section">
        <div className="glass controls-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Box className="text-blue-400" size={24} color="#3b82f6" />
            <h1>Configurateur 3D</h1>
          </div>
          
          <div className="input-group">
            <label>Dimensions du stand (cm)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={standWidth}
                onChange={(e) => setStandSize(Number(e.target.value), standDepth)}
                placeholder="Largeur"
              />
              <span style={{ color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>×</span>
              <input
                type="number"
                value={standDepth}
                onChange={(e) => setStandSize(standWidth, Number(e.target.value))}
                placeholder="Profondeur"
              />
            </div>
          </div>
          <div className="input-group">
            <label>Catalogue de Modules</label>
            <div className="catalog">
              <div 
                className={`catalog-item ${draggingModule === 'cube' ? 'dragging' : ''}`}
                onMouseDown={() => setDraggingModule('cube')}
              >
                <div className="cube-icon" />
                <span>Cube 40cm</span>
              </div>
              <div 
                className={`catalog-item ${draggingModule === 'rectangle' ? 'dragging' : ''}`}
                onMouseDown={() => setDraggingModule('rectangle')}
              >
                <div className="rect-icon" />
                <span>Rect 67cm</span>
              </div>
              <div 
                className={`catalog-item ${draggingModule === 'plateau' ? 'dragging' : ''}`}
                onMouseDown={() => setDraggingModule('plateau')}
              >
                <div className="rect-icon" style={{ width: '40px', height: '10px' }} />
                <span>Plateau 120cm</span>
              </div>
            </div>
            <p className="hint">Maintenez pour glisser dans la scène</p>
          </div>
        </div>
      </div>

      <div className="bottom-section" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass camera-menu">
          <button 
            className={cameraView === 'perspective' ? 'active' : ''} 
            onClick={() => setCameraView('perspective')}
            title="Libre"
          >
            <Camera size={20} />
          </button>
          <button 
            className={cameraView === 'top' ? 'active' : ''} 
            onClick={() => setCameraView('top')}
            title="Dessus"
          >
            <Maximize size={20} style={{ transform: 'rotate(45deg)' }} />
          </button>
          <button 
            className={cameraView === 'front' ? 'active' : ''} 
            onClick={() => setCameraView('front')}
            title="Face"
          >
            F
          </button>
          <button 
            className={cameraView === 'left' ? 'active' : ''} 
            onClick={() => setCameraView('left')}
            title="Gauche"
          >
            G
          </button>
          <button 
            className={cameraView === 'right' ? 'active' : ''} 
            onClick={() => setCameraView('right')}
            title="Droite"
          >
            D
          </button>
          <button 
            className={cameraView === 'iso' ? 'active' : ''} 
            onClick={() => setCameraView('iso')}
            title="Isométrique"
          >
            ISO
          </button>
        </div>
      </div>
    </div>
  );
};

export default UI;
