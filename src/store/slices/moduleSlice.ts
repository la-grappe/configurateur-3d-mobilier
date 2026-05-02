/**
 * Module Store Slice
 * 
 * Manages all module-related state:
 * - placedModules array
 * - addModule, updateModule, removeModule
 * - rotateModule, setModuleVertical
 * - setModuleFaceColor
 */

import {
    rotateModule as rotateModuleTransform,
    toggleVertical as toggleVerticalTransform,
} from '../../utils/moduleTransforms';
import type { PlacedModule } from './useStore';

export interface ModuleState {
    placedModules: PlacedModule[];
    addModule: (module: PlacedModule) => void;
    updateModule: (id: string, position: [number, number, number]) => void;
    rotateModule: (id: string) => void;
    setModuleVertical: (id: string) => void;
    removeModule: (id: string) => void;
    setModuleFaceColor: (moduleId: string, faceIndex: number, color: string) => void;
}

export const createModuleSlice = (set: any): ModuleState => ({
    placedModules: [],

    addModule: (module) => set((state: any) => ({
        placedModules: [...state.placedModules, module],
    })),

    updateModule: (id, position) => set((state: any) => ({
        placedModules: state.placedModules.map((m: PlacedModule) =>
            m.id === id ? { ...m, position } : m
        ),
    })),

    rotateModule: (id) => set((state: any) => ({
        placedModules: state.placedModules.map((m: PlacedModule) =>
            m.id === id ? rotateModuleTransform(m) : m
        ),
    })),

    setModuleVertical: (id) => set((state: any) => ({
        placedModules: state.placedModules.map((m: PlacedModule) =>
            m.id === id ? toggleVerticalTransform(m) : m
        ),
    })),

    removeModule: (id) => set((state: any) => ({
        placedModules: state.placedModules.filter((m: PlacedModule) => m.id !== id),
    })),

    setModuleFaceColor: (moduleId, faceIndex, color) => set((state: any) => ({
        placedModules: state.placedModules.map((m: PlacedModule) => {
            if (m.id !== moduleId) return m;
            const newFaceColors = { ...(m.faceColors || {}) };

            if (color === 'transparent') {
                delete newFaceColors[faceIndex];
            } else {
                newFaceColors[faceIndex] = color;
            }

            return {
                ...m,
                faceColors: newFaceColors,
            };
        }),
    })),
});