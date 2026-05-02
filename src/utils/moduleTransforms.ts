/**
 * Module Transform Functions
 * 
 * Pure functions extracted from useStore.ts for:
 * - Rotating modules (toggle Y-axis rotation)
 * - Toggling vertical orientation (X-axis rotation)
 * - Calculating new positions after transformations
 * 
 * These functions are testable in isolation, independent of Zustand state.
 */

import type { PlacedModule } from '../store/useStore';

// ============================================================================
// Constants (from constants.ts)
// ============================================================================

const STEP_HEIGHT = 40;
const ROTATION_TOLERANCE = 0.1;
const MAX_MODULE_Y = 240;
const MIN_MODULE_Y = 0.1;

// ============================================================================
// ROTATE MODULE (Touche R)
// ============================================================================

/**
 * Toggle Y-axis rotation for a module (90° increments)
 * 
 * - Plateau: Only rotate on Y axis (X must stay 0)
 * - Cube/Rectangle: Toggle between 0° and 90° on Y
 * 
 * @param module - The module to rotate
 * @returns New module with updated rotation
 */
export const rotateModule = (module: PlacedModule): PlacedModule => {
    // All types: Progressive Y-rotation (0° → 90° → 180° → 270° → 360°/0°)
    const currentRotY = module.rotation[1];

    // Normalize current rotation to [0, 2π)
    let normalized = currentRotY % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;

    // Add 90° (π/2 radians)
    let newRotY = normalized + Math.PI / 2;

    // Wrap back to [0, 2π)
    newRotY = newRotY % (Math.PI * 2);

    // 🔍 DEBUG LOG
    const currentDeg = (currentRotY * 180 / Math.PI).toFixed(1);
    const newDeg = (newRotY * 180 / Math.PI).toFixed(1);
    console.log(`🔄 ROTATION DEBUG - Module ${module.id}:`, {
        currentRotY: `${currentDeg}°`,
        newRotY: `${newDeg}°`,
        position: {
            x: module.position[0].toFixed(2),
            y: module.position[1].toFixed(2),
            z: module.position[2].toFixed(2)
        }
    });

    return {
        ...module,
        rotation: [module.rotation[0], newRotY, module.rotation[2]],
    };
};

// ============================================================================
// TOGGLE VERTICAL (Touche V)
// ============================================================================

/**
 * Toggle vertical orientation of a module
 * 
 * Different logic per module type:
 * - Plateau: Rotate 90° on X-axis between horizontal (X=0) and vertical (X=π/2)
 * - Rectangle: Rotate on Z-axis between horizontal (Z=0) and vertical (Z=π/2)
 * - Cube: Rotate on X-axis between horizontal (X=0) and vertical (X=π/2)
 * 
 * @param module - The module to toggle
 * @returns New module with updated rotation and adjusted Y position
 */
export const toggleVertical = (module: PlacedModule): PlacedModule => {
    // ========== PLATEAU ==========
    if (module.type === 'plateau') {
        const isVertical = Math.abs(module.rotation[0] - Math.PI / 2) < ROTATION_TOLERANCE;

        if (isVertical) {
            // Vertical → Horizontal
            // Height changes from 80 to 2.5
            // Current center Y is at 40 height/2, we need to go to 1.25 height/2
            // So bottom = Y - 40, and new Y = bottom + 1.25
            const currentBottom = module.position[1] - 40;
            return {
                ...module,
                position: [module.position[0], currentBottom + 1.25, module.position[2]],
                rotation: [0, module.rotation[1], module.rotation[2]],
            };
        } else {
            // Horizontal → Vertical
            // Height changes from 2.5 to 80
            // Current center Y is at 1.25 height/2, we need to go to 40 height/2
            // So bottom = Y - 1.25, and new Y = bottom + 40
            const currentBottom = module.position[1] - 1.25;
            return {
                ...module,
                position: [module.position[0], currentBottom + 40, module.position[2]],
                rotation: [Math.PI / 2, module.rotation[1], module.rotation[2]],
            };
        }
    }

    // ========== RECTANGLE ==========
    if (module.type === 'rectangle') {
        const isVertical = Math.abs(module.rotation[2] - Math.PI / 2) < ROTATION_TOLERANCE;

        if (isVertical) {
            // Vertical → Horizontal
            // Height changes from 67 to 40
            // Current center at 67/2=33.5, new center at 40/2=20
            const currentBottom = module.position[1] - (67 / 2);
            return {
                ...module,
                position: [module.position[0], currentBottom + 20, module.position[2]],
                rotation: [module.rotation[0], module.rotation[1], 0],
            };
        } else {
            // Horizontal → Vertical
            // Height changes from 40 to 67
            // Current center at 40/2=20, new center at 67/2=33.5
            const currentBottom = module.position[1] - 20;
            return {
                ...module,
                position: [module.position[0], currentBottom + (67 / 2), module.position[2]],
                rotation: [module.rotation[0], module.rotation[1], Math.PI / 2],
            };
        }
    }

    // ========== CUBE ==========
    if (module.type === 'cube') {
        const isVertical = Math.abs(module.rotation[0] - Math.PI / 2) < ROTATION_TOLERANCE;

        if (isVertical) {
            // Vertical → Horizontal (cube 40x40, pas de changement de hauteur)
            return {
                ...module,
                rotation: [0, module.rotation[1], module.rotation[2]],
            };
        } else {
            // Horizontal → Vertical
            return {
                ...module,
                rotation: [Math.PI / 2, module.rotation[1], module.rotation[2]],
            };
        }
    }

    return module;
};

// ============================================================================
// STEP UP / STEP DOWN (Touches H / B)
// ============================================================================

/**
 * Move module up by STEP_HEIGHT (40 units)
 * Respects maximum Y position constraint
 * 
 * @param type - Module type (determines height)
 * @param rotation - Current rotation (to calculate actual height)
 * @param currentY - Current Y center position
 * @returns New Y position (or same if at max)
 */
export const stepModuleUp = (
    type: 'cube' | 'rectangle' | 'plateau',
    rotation: [number, number, number],
    currentY: number
): number => {
    const newY = currentY + STEP_HEIGHT;

    // Get actual height to respect max bounds
    let moduleHeight = 40; // Default
    if (type === 'plateau') {
        const isVertical = Math.abs(rotation[0] - Math.PI / 2) < ROTATION_TOLERANCE;
        moduleHeight = isVertical ? 80 : 2.5;
    } else if (type === 'rectangle') {
        const isVertical = Math.abs(rotation[2] - Math.PI / 2) < ROTATION_TOLERANCE;
        moduleHeight = isVertical ? 67 : 40;
    }

    const maxY = MAX_MODULE_Y - moduleHeight / 2;
    return Math.min(newY, maxY);
};

/**
 * Move module down by STEP_HEIGHT (40 units)
 * Respects minimum Y position constraint
 * 
 * @param type - Module type
 * @param rotation - Current rotation
 * @param currentY - Current Y center position
 * @returns New Y position (or same if at min)
 */
export const stepModuleDown = (
    type: 'cube' | 'rectangle' | 'plateau',
    rotation: [number, number, number],
    currentY: number
): number => {
    const newY = currentY - STEP_HEIGHT;

    // Get actual height to respect min bounds
    let moduleHeight = 40; // Default
    if (type === 'plateau') {
        const isVertical = Math.abs(rotation[0] - Math.PI / 2) < ROTATION_TOLERANCE;
        moduleHeight = isVertical ? 80 : 2.5;
    } else if (type === 'rectangle') {
        const isVertical = Math.abs(rotation[2] - Math.PI / 2) < ROTATION_TOLERANCE;
        moduleHeight = isVertical ? 67 : 40;
    }

    const minY = moduleHeight / 2; // Just half height, not MIN_MODULE_Y
    return Math.max(newY, minY);
};

// ============================================================================
// POSITION AFTER ROTATION
// ============================================================================

/**
 * Calculate new Y position when a module is rotated
 * Used to prevent modules from falling through floor after rotation
 * 
 * @param module - The module being rotated
 * @param newRotation - The new rotation values
 * @returns Updated Y position (if needed)
 */
export const calculatePositionAfterRotation = (
    module: PlacedModule,
    newRotation: [number, number, number]
): [number, number, number] => {
    // For most cases, we keep the same position
    // Only special case: if module height changes significantly,
    // we might need to adjust Y to keep bottom aligned

    const position = [...module.position] as [number, number, number];

    // This is a simple implementation - more complex logic
    // would calculate actual AABB changes and reposition accordingly

    return position;
};

// ============================================================================
// UTILITY: Get module height based on type and rotation
// ============================================================================

/**
 * Calculate the actual height of a module given its type and rotation
 * Used for Y-position calculations
 * 
 * @param type - Module type
 * @param rotation - Current rotation
 * @returns Actual height (Y dimension)
 */
export const getModuleHeight = (
    type: 'cube' | 'rectangle' | 'plateau',
    rotation: [number, number, number]
): number => {
    if (type === 'cube') {
        return 40; // Cube is symmetric
    }

    if (type === 'rectangle') {
        const isVertical = Math.abs(rotation[2] - Math.PI / 2) < ROTATION_TOLERANCE;
        return isVertical ? 67 : 40;
    }

    if (type === 'plateau') {
        const isVertical = Math.abs(rotation[0] - Math.PI / 2) < ROTATION_TOLERANCE;
        return isVertical ? 80 : 2.5;
    }

    return 40; // Fallback
};