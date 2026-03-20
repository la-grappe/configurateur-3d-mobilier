import { create } from 'zustand';

export interface PlacedModule {
  id: string;
  type: 'cube' | 'rectangle' | 'plateau';
  position: [number, number, number];
  rotation: [number, number, number];
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
}

export const useStore = create<State>((set) => ({
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
      if (m.type === 'plateau') {
        // Toggle between flat (X=0) and vertical (X=π/2)
        const isVertical = Math.abs(m.rotation[0]) > 0.1;
        return { ...m, rotation: [isVertical ? 0 : Math.PI / 2, m.rotation[1], m.rotation[2]] };
      }
      // Rectangles / cubes: rotate around Y by 90°
      return { ...m, rotation: [m.rotation[0], m.rotation[1] + Math.PI / 2, m.rotation[2]] };
    })
  })),
  setModuleVertical: (id) => set((state) => ({
    placedModules: state.placedModules.map((m) => {
      if (m.id !== id) return m;
      if (m.type === 'plateau') {
        // Stand the plateau upright as a vertical panel (rotate around X)
        return { ...m, rotation: [Math.PI / 2, m.rotation[1], m.rotation[2]] };
      }
      if (m.type === 'rectangle') {
        // Stand on narrow side (rotate around Z).
        // Preserve the bottom surface so it stays on the ground or on whatever was below it.
        //   Flat half-height = 40/2 = 20 cm
        //   Vertical half-height = 67/2 = 33.5 cm
        //   Bottom before = cy - 20
        //   To keep bottom the same after: cy_new = (cy - 20) + 33.5 = cy + 13.5
        const currentBottom = m.position[1] - 20;
        const newHalfHeight = 67 / 2;
        const newY = currentBottom + newHalfHeight;
        return {
          ...m,
          position: [m.position[0], newY, m.position[2]],
          rotation: [m.rotation[0], m.rotation[1], Math.PI / 2],
        };
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
}));
