import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, User } from 'lucide-react';

const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'Blanc',
  '#d2b48c': 'Bois',
  '#0a192f': 'Bleu Foncé',
  '#e5e7eb': 'Gris Clair',
  '#facc15': 'Jaune',
  '#8b5cf6': 'Violet'
};

export const QuoteModal = () => {
  const isQuoteModalOpen = useStore((state) => state.isQuoteModalOpen);
  const setQuoteModalOpen = useStore((state) => state.setQuoteModalOpen);
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

  if (!isQuoteModalOpen) return null;

  const totalModules = stats.cubes + stats.rectangles + stats.plateaux;
  const totalFaces = Object.values(stats.colors).reduce((a, b) => a + b, 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pointer-events-auto" 
      onClick={() => setQuoteModalOpen(false)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* La boîte blanche du devis */}
      <div 
        className="relative bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        
        {/* LE BOUTON FERMER (Obligatoire) */}
        <button 
          onClick={() => setQuoteModalOpen(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold leading-none"
          aria-label="Fermer"
        >
          &times;
        </button>

        {/* L'EN-TÊTE AVEC LE LOGO */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 mb-6 gap-4">
          <img 
            src="/logo.png" 
            alt="Muto Event" 
            className="h-16 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider text-right">
            Devis Estimatif
          </h2>
        </div>

        {/* Content Section */}
        <div className="quote-content flex-grow">
          <div className="flex justify-between mt-4 text-sm text-gray-600 mb-6 font-medium">
            <span>Date: {new Date().toLocaleDateString('fr-FR')}</span>
            <span>Réf: DE-{Math.floor(Math.random() * 90000 + 10000)}</span>
          </div>

          {placedModules.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" color="#9ca3af" />
              <p>Votre stand est vide. Ajoutez des modules pour générer un devis.</p>
            </div>
          ) : (
            <table className="w-full quote-table" style={{ color: '#1a1a1a' }}>
              <thead>
                <tr>
                  <th className="text-left py-3 text-gray-400 font-semibold uppercase text-xs border-b">Désignation</th>
                  <th className="text-right py-3 text-gray-400 font-semibold uppercase text-xs border-b">Quantité</th>
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
                  <td className="pt-10 text-xl font-bold uppercase border-t-2 border-black" style={{ borderTop: '2px solid black' }}>Total Éléments Mobiliers</td>
                  <td className="pt-10 text-right text-xl font-bold border-t-2 border-black" style={{ borderTop: '2px solid black' }}>
                    {totalModules} unités
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Footer Section */}
        <div className="quote-footer border-t border-gray-100 pt-8 mt-12 flex justify-between items-center text-sm text-gray-400" style={{ borderTop: '1px solid #f3f4f6' }}>
          <div className="flex items-center gap-2">
             <User size={16} color="#9ca3af" />
             <span>Document généré numériquement - Muto Event</span>
          </div>
          <button 
            className="print-btn"
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold' }}
            onClick={() => window.print()}
          >
            Exporter en PDF
          </button>
        </div>
      </div>
    </div>
  );
};
