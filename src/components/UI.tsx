import React from 'react';
import { useStore } from '../store';
import { Maximize, Box, Camera, Eraser, FileText, Sun, Moon } from 'lucide-react';
import { QuoteModal } from './QuoteModal';

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
    setSelectedColor,
    setQuoteModalOpen,
    theme,
    setTheme
  } = useStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Contrast logic based on user requirements
  const containerClasses = "bg-white dark:bg-[#0a192f] border border-[#e5e7eb] dark:border-transparent shadow-xl dark:shadow-none rounded-xl p-6 pointer-events-auto flex flex-col gap-6 transition-all duration-300";
  const textMainClasses = "text-[#111827] dark:text-white transition-colors";
  const textSecClasses = "text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider transition-colors";
  const inputClasses = "bg-slate-50 dark:bg-slate-800/50 text-[#111827] dark:text-white border border-slate-300 dark:border-slate-700 outline-none focus:border-blue-500 p-2 rounded w-full text-sm transition-all";

  return (
    <div className="ui-overlay pointer-events-none fixed inset-0 p-6 flex flex-col justify-between z-10 font-sans">
      {/* Top Section */}
      <div className="flex justify-between items-start w-full pointer-events-none">
        <div className={`${containerClasses} w-[320px]`}>
          <div className="flex items-center gap-3">
            <Box size={24} className="text-blue-500" />
            <h1 className={`text-xl font-bold uppercase tracking-tight ${textMainClasses}`}>Configurateur 3D</h1>
          </div>

          <div className="flex flex-col gap-2">
            <label className={textSecClasses}>Dimensions du stand (cm)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={inputClasses}
                value={standWidth}
                onChange={(e) => setStandSize(Number(e.target.value), standDepth)}
                placeholder="Largeur"
              />
              <span className="text-slate-400 font-bold">×</span>
              <input
                type="number"
                className={inputClasses}
                value={standDepth}
                onChange={(e) => setStandSize(standWidth, Number(e.target.value))}
                placeholder="Profondeur"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className={textSecClasses}>Catalogue de Modules</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'cube', label: 'Cube 40cm', icon: <div className="w-6 h-6 border-2 border-slate-900 dark:border-white rounded-sm" /> },
                { id: 'rectangle', label: 'Rect 67cm', icon: <div className="w-8 h-6 border-2 border-slate-900 dark:border-white rounded-sm" /> },
                { id: 'plateau', label: 'Plateau 120cm', icon: <div className="w-12 h-2 border-2 border-slate-900 dark:border-white rounded-sm" />, span: true },
              ].map((mod) => (
                <div
                  key={mod.id}
                  className={`bg-slate-50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all p-3 rounded-lg flex flex-col items-center gap-2 ${mod.span ? 'col-span-2' : ''} ${draggingModule === mod.id ? 'ring-2 ring-blue-500 scale-95 shadow-inner' : 'shadow-sm active:scale-95'}`}
                  onMouseDown={() => setDraggingModule(mod.id as any)}
                >
                  <div className="opacity-80 dark:opacity-100">{mod.icon}</div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{mod.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] italic text-slate-400 text-center font-medium">Maintenez pour glisser dans la scène</p>
          </div>
        </div>
      </div>

      {/* Top Right Controls Group */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 pointer-events-auto">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 hover:brightness-110"
          style={{ backgroundColor: '#10b981' }}
          onClick={() => setQuoteModalOpen(true)}
        >
          <FileText size={20} />
          <span className="tracking-wide">Générer le devis</span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#0a192f] text-[#111827] dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
          title={theme === 'dark' ? 'Passer au Mode Clair' : 'Passer au Mode Sombre'}
        >
          {theme === 'dark' ? (
            <Sun size={24} className="text-yellow-400" />
          ) : (
            <Moon size={24} className="text-blue-600" />
          )}
        </button>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-4 pointer-events-none w-full">
        {/* Color Palette */}
        <div className="bg-white dark:bg-[#0a192f] border border-[#e5e7eb] dark:border-slate-700 shadow-2xl rounded-2xl p-4 flex gap-4 pointer-events-auto transition-all">
          <button
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === 'transparent' ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-500'}`}
            onClick={() => setSelectedColor('transparent')}
            title="Gomme (Vider)"
          >
            <Eraser size={20} />
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 self-center" />

          {COLORS.map((color) => (
            <button
              key={color.hex}
              className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${selectedColor === color.hex ? 'border-blue-500 scale-110 shadow-lg' : 'border-white dark:border-slate-700 shadow-sm'}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setSelectedColor(selectedColor === color.hex ? null : color.hex)}
              title={color.name}
            />
          ))}

          <button
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${selectedColor === null ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            onClick={() => setSelectedColor(null)}
            title="Sélecteur"
          >
            ✕
          </button>
        </div>

        {/* Camera Controls */}
        <div className="bg-white dark:bg-[#0a192f] border border-[#e5e7eb] dark:border-slate-700 shadow-2xl rounded-2xl p-2 flex gap-2 pointer-events-auto transition-all">
          {[
            { id: 'perspective', icon: <Camera size={22} />, label: 'Libre' },
            { id: 'top', icon: <Maximize size={22} className="rotate-45" />, label: 'Dessus' },
            { id: 'front', icon: 'F', label: 'Face' },
            { id: 'left', icon: 'G', label: 'Gauche' },
            { id: 'right', icon: 'D', label: 'Droite' },
            { id: 'iso', icon: 'ISO', label: 'Isom' },
          ].map((view) => (
            <button
              key={view.id}
              className={`min-w-[50px] h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all active:scale-95 ${cameraView === view.id ? 'bg-blue-500 text-white shadow-lg' : 'text-[#111827] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              onClick={() => setCameraView(view.id as any)}
              title={view.label}
            >
              {view.icon}
            </button>
          ))}
        </div>
      </div>

      <QuoteModal />
    </div>
  );
};

export default UI;
