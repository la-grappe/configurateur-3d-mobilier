// Shared module dimensions (in units, typically cm)
export const MODULE_SIZES = {
  cube: { width: 40, height: 40, depth: 40 },
  rectangle: { width: 67, height: 40, depth: 40 },
  plateau: { width: 80, height: 2.5, depth: 80 },
} as const;

export type ModuleType = keyof typeof MODULE_SIZES;

// Color palette
export const MODULE_COLORS = [
  { name: 'Blanc', hex: '#ffffff' },
  { name: 'Bois', hex: '#d2b48c' },
  { name: 'Bleu', hex: '#0a192f' },
  { name: 'Gris', hex: '#e5e7eb' },
  { name: 'Jaune', hex: '#facc15' },
  { name: 'Violet', hex: '#8b5cf6' },
] as const;

// Scene limits
export const STAND_LIMITS = {
  maxHeight: 240,
  stepHeight: 40,
} as const;

// Frame color for modules
export const FRAME_COLOR = "#d2b48c";
