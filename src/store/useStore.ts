import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MODULE_SIZES } from '../constants/modules';

export interface PlacedModule {
  id: string;
  type: 'cube' | 'rectangle' | 'plateau';
  position: [number, number, number];
  rotation: [number, number, number];
  faceColors?: Record<number, string>;
}

interface State {
  standWidth: number;
  standDepth: number;
  setStandSize: (width: number, depth: number) => void;
  cameraView: 'perspective' | 'top' | 'front' | 'left' | 'right' | 'iso';
  setCameraView: (view: State['cameraView']) => void;
  placedModules: PlacedModule[];
  addModule: (module: PlacedModule) => void;
  updateModule: (id: string, position: [number, number, number]) => void;
  rotateModule: (id: string) => void;
  setModuleVertical: (id: string) => void;
  removeModule: (id: string) => void;
  draggingModule: 'cube' | 'rectangle' | 'plateau' | null;
  setDraggingModule: (type: 'cube' | 'rectangle' | 'plateau' | null) => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  isInteracting: boolean;
  setIsInteracting: (interacting: boolean) => void;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  setModuleFaceColor: (moduleId: string, faceIndex: number, color: string) => void;
  isQuoteModalOpen: boolean;
  setQuoteModalOpen: (isOpen: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  // Config export/import
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
  // Help overlay
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

// Helper to get module height
const getModuleHeight = (type: string): number => MODULE_SIZES[type as keyof typeof MODULE_SIZES].height;

export const useStore = create<State>()(
  standWidth: 300,
  standDepth: 300,
  setStandSize: (width, depth) => set({ standWidth: width, standDepth: depth }),
  cameraView: 'perspective',
  setCameraView: (view) => set({ cameraView: view }),
  placedModules: [],
  addModule: (module) => set((state) => ({ placedModules: [...state.placedModules, module] })),
  updateModule: (id, position) => set((state) => ({
    placedModules: state.placedModules.map((m) => m.id === id ? { ...m, position } : m)
  })),
  rotateModule: (id) => set((state) => ({
    placedModules: state.placedModules.map((m) => {
      if (m.id !== id) return m;

      // Plateau : Rotation sur Y uniquement s'il n'est pas vertical (X=0)
      if (m.type === 'plateau') {
        const newRotY = Math.abs(m.rotation[1]) > 0.1 ? 0 : Math.PI / 2;
        return { ...m, rotation: [m.rotation[0], newRotY, m.rotation[2]] };
      }

      // Cubes et Rectangles : Toggle binaire strict sur Y
      const newRotY = Math.abs(m.rotation[1]) > 0.1 ? 0 : Math.PI / 2;
      return { ...m, rotation: [m.rotation[0], newRotY, m.rotation[2]] };
    })
  })),
  setModuleVertical: (id) => set((state) => ({
    placedModules: state.placedModules.map((m) => {
      if (m.id !== id) return m;
      if (m.type === 'plateau') {
        const isVertical = Math.abs(m.rotation[0] - Math.PI / 2) < 0.1;
        if (isVertical) {
          const currentBottom = m.position[1] - 40;
          return {
            ...m,
            position: [m.position[0], currentBottom + 1.25, m.position[2]],
            rotation: [0, m.rotation[1], m.rotation[2]]
          };
        } else {
          const currentBottom = m.position[1] - 1.25;
          return {
            ...m,
            position: [m.position[0], currentBottom + 40, m.position[2]],
            rotation: [Math.PI / 2, m.rotation[1], m.rotation[2]]
          };
        }
      }
      if (m.type === 'rectangle') {
        const isVertical = Math.abs(m.rotation[2] - Math.PI / 2) < 0.1;
        if (isVertical) {
          const currentBottom = m.position[1] - 67 / 2;
          return {
            ...m,
            position: [m.position[0], currentBottom + 20, m.position[2]],
            rotation: [m.rotation[0], m.rotation[1], 0],
          };
        } else {
          const currentBottom = m.position[1] - 20;
          return {
            ...m,
            position: [m.position[0], currentBottom + 67 / 2, m.position[2]],
            rotation: [m.rotation[0], m.rotation[1], Math.PI / 2],
          };
        }
      }
      return m;
    })
  })),
  removeModule: (id) => set((state) => ({ placedModules: state.placedModules.filter((m) => m.id !== id) })),
  draggingModule: null,
  setDraggingModule: (type) => set({ draggingModule: type }),
  selectedModuleId: null,
  setSelectedModuleId: (id) => set({ selectedModuleId: id }),
  isInteracting: false,
  setIsInteracting: (interacting) => set({ isInteracting: interacting }),
  selectedColor: null,
  setSelectedColor: (color) => set({ selectedColor: color }),
  setModuleFaceColor: (moduleId, faceIndex, color) => set((state) => ({
    placedModules: state.placedModules.map((m) => {
      if (m.id !== moduleId) return m;
      const newFaceColors = { ...(m.faceColors || {}) };
      
      if (color === 'transparent') {
        delete newFaceColors[faceIndex];
      } else {
        newFaceColors[faceIndex] = color;
      }

      return {
        ...m,
        faceColors: newFaceColors
      };
    })
  })),
  isQuoteModalOpen: false,
  setQuoteModalOpen: (isOpen) => set({ isQuoteModalOpen: isOpen }),
  theme: 'dark',
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
    
    // Undo/Redo
    canUndo: false,
    canRedo: false,
    undo: () => {
      const state = useStore.getState() as any;
      if (state._past && state._past.length > 0) {
        const previous = state._past[state._past.length - 1];
        const current = state.placedModules;
        useStore.setState({
          placedModules: previous,
          canUndo: state._past.length > 1,
          canRedo: true,
          _past: state._past.slice(0, -1),
          _future: [current, ...(state._future || [])]
        });
      }
    },
    redo: () => {
      const state = useStore.getState() as any;
      if (state._future && state._future.length > 0) {
        const next = state._future[0];
        const current = state.placedModules;
        useStore.setState({
          placedModules: next,
          canUndo: true,
          canRedo: state._future.length > 1,
          _past: [...(state._past || []), current],
          _future: state._future.slice(1)
        });
      }
    },
    
    // Internal history state
    _past: [] as any[],
    _future: [] as any[],
    
    // Config export/import
    exportConfig: () => {
      const state = useStore.getState();
      return JSON.stringify({
        standWidth: state.standWidth,
        standDepth: state.standDepth,
        placedModules: state.placedModules,
        theme: state.theme
      }, null, 2);
    },
    
    importConfig: (json: string) => {
      try {
        const config = JSON.parse(json);
        if (config.placedModules && Array.isArray(config.placedModules)) {
          useStore.setState({
            standWidth: config.standWidth || 300,
            standDepth: config.standDepth || 300,
            placedModules: config.placedModules,
            theme: config.theme || 'dark'
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    
    // Help overlay
    showHelp: false,
    setShowHelp: (show: boolean) => useStore.setState({ showHelp: show }),
  }))
  
// Subscribe to track history
let previousModules: any[] = [];
useStore.subscribe(
  (state: any) => state.placedModules,
  (currentModules: any[]) => {
    const state = useStore.getState() as any;
    if (currentModules !== previousModules && currentModules !== (state._future || [])[0]) {
      const newPast = [...(state._past || []), previousModules].slice(-50);
      useStore.setState({ 
        _past: newPast, 
        _future: [],
        canUndo: newPast.length > 0,
        canRedo: false 
      });
    }
    previousModules = currentModules;
  }
);
previousModules = useStore.getState().placedModules;
