import { create } from 'zustand';
import { createModuleSlice, type ModuleState } from './moduleSlice';
import { createUISlice, type UIState } from './uiSlice';
import { createConfigSlice, type ConfigState } from './configSlice';

export interface PlacedModule {
  id: string;
  type: 'cube' | 'rectangle' | 'plateau';
  position: [number, number, number];
  rotation: [number, number, number];
  faceColors?: Record<number, string>;
}

export type State = ModuleState & UIState & ConfigState;

/**
 * Main Store combining all slices
 * 
 * Slices:
 * - ModuleState: placedModules, transforms, face colors
 * - UIState: camera, selection, interactions
 * - ConfigState: stand size, theme
 */
export const useStore = create<State>((set) => ({
  // Module Slice
  ...createModuleSlice(set),

  // UI Slice
  ...createUISlice(set),

  // Config Slice
  ...createConfigSlice(set),
}));