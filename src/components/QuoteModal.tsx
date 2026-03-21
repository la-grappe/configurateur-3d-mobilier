import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { X, FileText, ShoppingCart, User } from 'lucide-react';

interface QuoteModalProps {
  onClose: () => void;
}

const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'Blanc',
  '#d2b48c': 'Bois',
  '#0a192f': 'Bleu Foncé',
  '#e5e7eb': 'Gris Clair',
  '#facc15': 'Jaune',
  '#8b5cf6': 'Violet'
};

const QuoteModal: React.FC<QuoteModalProps> = ({ onClose }) => {
  const placedModules = useStore((state) => state.placedModules);

  const stats = useMemo(() => {
    let cubes = 0;
    let rectangles = 0;
    let plateaux = 0;

    const colors = placedModules.reduce((acc, m) => {
      if (m.type === 'cube') cubes++;
      else if (m.type === 'rectangle') rectangles++;
      else if (m.type === 'plateau') plateaux++;

      if (m.faceColors) {
        Object.values(m.faceColors).forEach(color => {
          acc[color] = (acc[color] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return { cubes, rectangles, plateaux, colors };
  }, [placedModules]);

  const totalModules = stats.cubes + stats.rectangles + stats.plateaux;
  const totalFaces = Object.values(stats.colors).reduce((a, b) => a + b, 0);

  return (
    <div className="quote-overlay">
      <div className="quote-paper shadow-2xl" style={{ position: 'relative' }}>
        {/* Absolute Close Button */}
        <button 
          onClick={onClose}
          className="close-quote-btn"
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}
        >
          <X size={28} color="#000" />
        </button>

        {/* Header Section */}
        <div className="quote-header">
          <div className="flex justify-between items-start">
            <div className="quote-logo-side">
              <img src="/logo.png" alt="Muto Event" style={{ height: '50px', objectFit: 'contain', marginBottom: '1.5rem' }} />
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xl uppercase tracking-wider text-black">Muto Event - Mobiliers</span>
              </div>
              <p className="text-gray-500 text-sm">Configurateur de stands modualires</p>
            </div>
          </div>
          
          <div className="quote-title-block mt-12">
            <h2 className="text-3xl font-bold border-b-2 border-black pb-2">Devis Estimatif</h2>
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span>Date: {new Date().toLocaleDateString('fr-FR')}</span>
              <span>Réf: DE-{Math.floor(Math.random() * 90000 + 10000)}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="quote-content mt-12 px-2 flex-grow">
          {placedModules.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" color="#9ca3af" />
              <p>Votre stand est vide. Ajoutez des modules pour générer un devis.</p>
            </div>
          ) : (
            <table className="w-full quote-table">
              <thead>
                <tr>
                  <th className="text-left py-3 text-gray-400 font-semibold uppercase text-xs">Désignation</th>
                  <th className="text-right py-3 text-gray-400 font-semibold uppercase text-xs">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {stats.cubes > 0 && (
                  <tr>
                    <td className="py-4 font-medium">Module Cubique 40x40x40 cm - Structure Bois</td>
                    <td className="py-4 text-right font-bold">{stats.cubes}</td>
                  </tr>
                )}
                {stats.rectangles > 0 && (
                  <tr>
                    <td className="py-4 font-medium">Module Rectangulaire 67x40x40 cm - Structure Bois</td>
                    <td className="py-4 text-right font-bold">{stats.rectangles}</td>
                  </tr>
                )}
                {stats.plateaux > 0 && (
                  <tr>
                    <td className="py-4 font-medium">Plateau de Finition Supérieur 80x80 cm</td>
                    <td className="py-4 text-right font-bold">{stats.plateaux}</td>
                  </tr>
                )}
                
                {totalFaces > 0 && (
                  <>
                    <tr>
                      <td className="pt-6 pb-2 font-bold text-sm uppercase">Option : Personnalisation Couleurs</td>
                      <td className="pt-6 pb-2 text-right font-bold text-sm">{totalFaces} faces</td>
                    </tr>
                    {Object.entries(stats.colors).map(([hex, count]) => (
                      <tr key={hex}>
                        <td className="py-2 pl-6 text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <div style={{ width: '16px', height: '16px', backgroundColor: hex, border: '1px solid #ddd', borderRadius: '2px' }} />
                            <span>{count} x Panneaux "{COLOR_NAMES[hex] || hex}"</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-sm text-gray-400 italic">incl.</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-10 text-xl font-bold uppercase border-t-2 border-black">Total Éléments Mobiliers</td>
                  <td className="pt-10 text-right text-xl font-bold border-t-2 border-black">
                    {totalModules} unités
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Footer Section */}
        <div className="quote-footer border-t border-gray-100 pt-8 mt-12 flex justify-between items-center text-sm text-gray-400">
          <div className="flex items-center gap-2">
             <User size={16} color="#9ca3af" />
             <span>Document généré numériquement - Muto Event</span>
          </div>
          <button 
            className="print-btn"
            onClick={() => window.print()}
          >
            Exporter en PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
