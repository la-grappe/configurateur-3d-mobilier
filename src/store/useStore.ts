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
}));
