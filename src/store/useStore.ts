import { create } from 'zustand';
import {
  rotateModule as rotateModuleTransform,
  toggleVertical as toggleVerticalTransform,
} from '../utils/moduleTransforms';

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

  // ✅ Utiliser la fonction pure de moduleTransforms
  rotateModule: (id) => set((state) => ({
    placedModules: state.placedModules.map((m) =>
      m.id === id ? rotateModuleTransform(m) : m
    )
  })),

  // ✅ Utiliser la fonction pure de moduleTransforms
  setModuleVertical: (id) => set((state) => ({
    placedModules: state.placedModules.map((m) =>
      m.id === id ? toggleVerticalTransform(m) : m
    )
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
}));