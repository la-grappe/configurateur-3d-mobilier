/**
 * Global Constants for Configurateur 3D Mobilier
 * 
 * This file centralizes all magic numbers and configuration values
 * to make the code more maintainable and readable.
 */

// ============================================================================
// MODULE SIZES (in cm)
// ============================================================================

export const MODULE_SIZES = {
    cube: { width: 40, height: 40, depth: 40 },
    rectangle: { width: 67, height: 40, depth: 40 },
    plateau: { width: 80, height: 2.5, depth: 80 },
} as const;

// ============================================================================
// CAMERA POSITIONS (for different view modes)
// ============================================================================

export const CAMERA_POSITIONS = {
    perspective: { position: [300, 300, 300] as const, target: [0, 0, 0] as const },
    top: { position: [0, 500, 0] as const, target: [0, 0, 0] as const },
    front: { position: [0, 100, 500] as const, target: [0, 0, 0] as const },
    left: { position: [-500, 100, 0] as const, target: [0, 0, 0] as const },
    right: { position: [500, 100, 0] as const, target: [0, 0, 0] as const },
    iso: { position: [300, 300, 300] as const, target: [0, 0, 0] as const },
} as const;

// ============================================================================
// SNAPPING & COLLISION THRESHOLDS
// ============================================================================

/** Minimum overlap (in units) to consider two modules touching */
export const FOOTPRINT_OVERLAP_MIN = 1;

/** Distance threshold for vertex snapping (in units) */
export const VERTEX_SNAPPING_THRESHOLD = 100;

/** Threshold to distinguish horizontal vs vertical plateau (height in units) */
export const PLATEAU_HEIGHT_THRESHOLD = 10;

/** Tolerance for Y-rotation snapping (radians) */
export const ROTATION_TOLERANCE = 0.1; // ~5.7 degrees

/** Standard step height for vertical movements (cm) */
export const STEP_HEIGHT = 40;

/** Maximum Y position (center) for modules (cm) */
export const MAX_MODULE_Y = 240;

/** Minimum Y position (center) for modules (cm) */
export const MIN_MODULE_Y = 0.1;

// ============================================================================
// STAND DEFAULTS
// ============================================================================

export const STAND_DEFAULTS = {
    width: 300,
    depth: 300,
    maxHeight: 240,
    minWidth: 100,
    maxWidth: 2000,
    minDepth: 100,
    maxDepth: 2000,
} as const;

// ============================================================================
// 3D RENDERING & LIGHTING
// ============================================================================

export const LIGHTING = {
    ambient: {
        dark: 0.5,
        light: 0.8,
    },
    directional: {
        position: [100, 200, 100] as const,
        intensity: 1.5,
    },
    point: {
        position: [-100, 200, -100] as const,
        intensity: 1,
    },
} as const;

export const SHADOWS = {
    contactShadows: {
        position: [0, 0, 0] as const,
        opacity: 0.4,
        scale: 1000,
        blur: 2,
        far: 10,
        resolution: 256,
        color: '#000000',
    },
    zFighting: {
        gridY: 0,
        shadowY: -0.2,
        constructionPlaneY: -0.5,
    },
} as const;

// ============================================================================
// COLORS & THEME
// ============================================================================

export const THEME_CONFIG = {
    dark: {
        bgColor: '#0f172a',
        textMain: '#ffffff',
        textSecondary: '#94a3b8',
        borderColor: 'transparent',
        containerBg: '#0a192f',
        ambientIntensity: 0.5,
    },
    light: {
        bgColor: '#f1f5f9',
        textMain: '#111827',
        textSecondary: '#64748b',
        borderColor: '#e5e7eb',
        containerBg: '#ffffff',
        ambientIntensity: 0.8,
    },
} as const;

export const COLOR_PALETTE = [
    { name: 'Blanc', hex: '#ffffff' },
    { name: 'Bois', hex: '#d2b48c' },
    { name: 'Bleu', hex: '#0a192f' },
    { name: 'Gris', hex: '#e5e7eb' },
    { name: 'Jaune', hex: '#facc15' },
    { name: 'Violet', hex: '#8b5cf6' },
] as const;

// ============================================================================
// DRAG & INTERACTION
// ============================================================================

/** Mouse movement threshold (pixels) before drag starts */
export const DRAG_THRESHOLD_PX = 4;

/** Keyboard shortcuts */
export const KEYBOARD_SHORTCUTS = {
    rotate: ['r', 'R'],
    vertical: ['v', 'V'],
    delete: ['Delete', 'Backspace'],
    stepUp: ['h', 'H'],
    stepDown: ['b', 'B'],
} as const;

// ============================================================================
// UI DIMENSIONS & SPACING
// ============================================================================

export const UI_LAYOUT = {
    topLeftWidth: 320,
    padding: 6,
    gap: 6,
    borderRadius: 'rounded-xl',
} as const;

// ============================================================================
// PERFORMANCE & OPTIMIZATION
// ============================================================================

/** Collision detection margin (expands AABB slightly for safety) */
export const COLLISION_MARGIN = 0.5;

/** Number of frames to wait before updating position (for debouncing) */
export const POSITION_UPDATE_DEBOUNCE = 1;