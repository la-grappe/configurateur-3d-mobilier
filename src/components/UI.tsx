import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Maximize, Box, Camera, Eraser, FileText } from 'lucide-react';
import QuoteModal from './QuoteModal';

const COLORS = [
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Bois', hex: '#d2b48c' },
  { name: 'Bleu', hex: '#0a192f' },
  { name: 'Gris', hex: '#e5e7eb' },
  { name: 'Jaune', hex: '#facc15' },
  { name: 'Violet', hex: '#8b5cf6' },
];

const UI: React.FC = () => {
  const { 
    standWidth, 
    standDepth, 
    setStandSize, 
    cameraView, 
    setCameraView,
    draggingModule,
    setDraggingModule,
    selectedColor,
    setSelectedColor
  } = useStore();

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="ui-overlay">
      <div className="top-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        <div className="glass controls-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Box size={24} color="#3b82f6" />
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

        <div className="glass quote-trigger-panel" style={{ padding: '0.5rem' }}>
          <button 
            className="flex items-center gap-2"
            style={{ backgroundColor: '#10b981', borderColor: '#059669' }}
            onClick={() => setIsQuoteOpen(true)}
          >
            <FileText size={18} />
            <span>Générer le devis</span>
          </button>
        </div>
      </div>

      <div className="bottom-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div className="glass color-palette">
          <button 
            className={`color-btn ${selectedColor === 'transparent' ? 'active' : ''}`}
            style={{ 
              backgroundColor: '#374151', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}
            onClick={() => setSelectedColor('transparent')}
            title="Gomme (Vider)"
          >
            <Eraser size={16} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />

          {COLORS.map((color) => (
            <button
              key={color.hex}
              className={`color-btn ${selectedColor === color.hex ? 'active' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setSelectedColor(selectedColor === color.hex ? null : color.hex)}
              title={color.name}
            />
          ))}
          <button 
            className={`color-btn ${selectedColor === null ? 'active' : ''}`}
            style={{ 
              backgroundColor: 'transparent', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)'
            }}
            onClick={() => setSelectedColor(null)}
            title="Sélecteur"
          >
            ✕
          </button>
        </div>

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

      {isQuoteOpen && <QuoteModal onClose={() => setIsQuoteOpen(false)} />}
    </div>
  );
};

export default UI;
