import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

const HELP_CONTENT = [
  { key: 'R', action: 'Rotation 90° (rectangle/plateau)' },
  { key: 'V', action: 'Basculer à la verticale (rectangle/plateau)' },
  { key: 'H', action: 'Monter le module (pas de 40cm)' },
  { key: 'B', action: 'Descendre le module' },
  { key: 'Suppr', action: 'Supprimer le module' },
  { key: 'Clic', action: 'Sélectionner un module' },
  { key: 'Glisser', action: 'Déplacer un module' },
  { key: 'Couleurs', action: 'Cliquer une face pour colorier' },
  { key: 'Ctrl+Z', action: 'Annuler (Undo)' },
  { key: 'Ctrl+Y', action: 'Rétablir (Redo)' },
];

const HelpOverlay: React.FC = () => {
  const { showHelp, setShowHelp } = useStore();

  if (!showHelp) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8"
      onClick={() => setShowHelp(false)}
    >
      <div 
        className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Raccourcis Clavier</h2>
          <button 
            onClick={() => setShowHelp(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {HELP_CONTENT.map((item) => (
            <div 
              key={item.key}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-mono rounded min-w-[60px] text-center">
                {item.key}
              </kbd>
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.action}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">?</kbd> ou cliquez en dehors pour fermer
        </p>
      </div>
    </div>
  );
};

export default HelpOverlay;
