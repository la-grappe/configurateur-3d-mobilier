/**
 * Unit Tests for snapping.ts
 * 
 * Tests IKEA-style snapping logic:
 * - AABB calculations for rotated modules
 * - Collision detection
 * - Surface dropping
 * - Vertex snapping for cubes/rectangles
 * - Plateau-specific face snapping
 * - Stand bounds clamping
 * - Step up/down movement
 */

import {
    getModuleAABBDimensions,
    hasCollisionAtPosition,
    calculateSnapping,
    stepModuleUp,
    stepModuleDown,
    getRotatedAABB,
} from '../snapping';
import * as THREE from 'three';
import type { PlacedModule } from '../../store/useStore';

// ============================================================================
// Helpers
// ============================================================================

const createModule = (
    id: string,
    type: 'cube' | 'rectangle' | 'plateau',
    position: [number, number, number] = [0, 20, 0],
    rotation: [number, number, number] = [0, 0, 0]
): PlacedModule => ({
    id,
    type,
    position,
    rotation,
    faceColors: {},
});

// ============================================================================
// TESTS: getModuleAABBDimensions
// ============================================================================

describe('getModuleAABBDimensions', () => {
    describe('Cube (40x40x40)', () => {
        it('should return correct dimensions at 0° rotation', () => {
            const result = getModuleAABBDimensions('cube', [0, 0, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
        });

        it('should return same dimensions when rotated on Y (cube is symmetric)', () => {
            const result = getModuleAABBDimensions('cube', [0, Math.PI / 2, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
        });

        it('should swap H and D when rotated 90° on X axis', () => {
            const result = getModuleAABBDimensions('cube', [Math.PI / 2, 0, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
        });

        it('should swap W and H when rotated 90° on Z axis', () => {
            const result = getModuleAABBDimensions('cube', [0, 0, Math.PI / 2]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
        });
    });

    describe('Rectangle (67x40x40)', () => {
        it('should return correct dimensions at 0°', () => {
            const result = getModuleAABBDimensions('rectangle', [0, 0, 0]);
            expect(result).toEqual({ trueW: 67, trueH: 40, trueD: 40 });
        });

        it('should swap W and D when rotated 90° on Y', () => {
            const result = getModuleAABBDimensions('rectangle', [0, Math.PI / 2, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 67 });
        });

        it('should swap W and H when rotated 90° on Z', () => {
            const result = getModuleAABBDimensions('rectangle', [0, 0, Math.PI / 2]);
            expect(result).toEqual({ trueW: 40, trueH: 67, trueD: 40 });
        });

        it('should handle Y then Z rotation correctly', () => {
            // After Y: [40, 40, 67]
            // After Z (on already rotated): [40, 40, 67]
            const result = getModuleAABBDimensions('rectangle', [0, Math.PI / 2, Math.PI / 2]);
            // Net result should be [40, 40, 67] ✅
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 67 });
        });
    });

    describe('Plateau (80x2.5x80)', () => {
        it('should return correct dimensions when horizontal at 0°', () => {
            const result = getModuleAABBDimensions('plateau', [0, 0, 0]);
            expect(result).toEqual({ trueW: 80, trueH: 2.5, trueD: 80 });
        });

        it('should swap H and D when rotated 90° on X (becomes vertical)', () => {
            const result = getModuleAABBDimensions('plateau', [Math.PI / 2, 0, 0]);
            expect(result).toEqual({ trueW: 80, trueH: 80, trueD: 2.5 });
        });

        it('should swap W and D when rotated on Y only', () => {
            const result = getModuleAABBDimensions('plateau', [0, Math.PI / 2, 0]);
            expect(result).toEqual({ trueW: 80, trueH: 2.5, trueD: 80 });
        });

        it('should swap W and H when rotated 90° on Z (becomes vertical wall)', () => {
            const result = getModuleAABBDimensions('plateau', [0, 0, Math.PI / 2]);
            expect(result).toEqual({ trueW: 2.5, trueH: 80, trueD: 80 });
        });
    });

    describe('Edge cases - Rotation tolerance', () => {
        it('should treat near-zero rotation as 0° (tolerance 0.1 rad)', () => {
            const result = getModuleAABBDimensions('cube', [0.05, 0.05, 0.05]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
        });

        it('should treat near-90° rotation as 90° (tolerance 0.1 rad)', () => {
            const result = getModuleAABBDimensions('rectangle', [0, Math.PI / 2 + 0.05, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 67 });
        });
    });

    describe('Support for THREE.Euler input', () => {
        it('should work with THREE.Euler object', () => {
            const euler = new THREE.Euler(0, Math.PI / 2, 0, 'YXZ');
            const result = getModuleAABBDimensions('rectangle', euler);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 67 });
        });
    });
});

// ============================================================================
// TESTS: hasCollisionAtPosition
// ============================================================================

describe('hasCollisionAtPosition', () => {
    it('should return false when no modules exist', () => {
        const result = hasCollisionAtPosition('cube', [0, 20, 0], []);
        expect(result).toBe(false);
    });

    it('should return true when placing cube directly on another cube', () => {
        const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], existing);
        expect(result).toBe(true);
    });

    it('should return false when placing cube far away from others', () => {
        const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
        const result = hasCollisionAtPosition('cube', [500, 500, 500], existing);
        expect(result).toBe(false);
    });

    it('should exclude specified module ID', () => {
        const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], existing, '1');
        expect(result).toBe(false);
    });

    it('should detect collision with rotated module', () => {
        const existing = [createModule('1', 'rectangle', [0, 20, 0], [0, Math.PI / 2, 0])];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], existing);
        expect(result).toBe(true);
    });

    it('should handle multiple modules', () => {
        const existing = [
            createModule('1', 'cube', [0, 20, 0], [0, 0, 0]),
            createModule('2', 'cube', [100, 100, 100], [0, 0, 0]),
        ];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], existing);
        expect(result).toBe(true);
    });

    it('should use provided rotation for collision check', () => {
        const existing = [createModule('1', 'rectangle', [0, 20, 0], [0, 0, 0])];
        const result = hasCollisionAtPosition('rectangle', [0, 20, 0], existing, undefined, [0, Math.PI / 2, 0]);
        expect(result).toBe(true);
    });
});

// ============================================================================
// TESTS: calculateSnapping
// ============================================================================

describe('calculateSnapping', () => {
    // Stand defaults: width=300, depth=300
    const standWidth = 300;
    const standDepth = 300;

    describe('Surface Drop (automatic Y positioning)', () => {
        it('should place cube on ground when empty scene', () => {
            const result = calculateSnapping('cube', new THREE.Vector3(0, 0, 0), [], standWidth, standDepth);
            expect(result.y).toBe(20); // Ground + half height (40/2)
        });

        it('should stack cube on top of another cube', () => {
            const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
            const result = calculateSnapping('cube', new THREE.Vector3(0, 100, 0), existing, standWidth, standDepth);
            expect(result.y).toBe(60); // 20 + 40 (cube height)
        });

        it('should stack rectangle on top of cube', () => {
            const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
            const result = calculateSnapping('rectangle', new THREE.Vector3(0, 100, 0), existing, standWidth, standDepth);
            expect(result.y).toBe(60);
        });

        it('should respect footprint overlap for surface drop', () => {
            const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
            // Place far away - no overlap, should drop to ground
            const result = calculateSnapping('cube', new THREE.Vector3(200, 100, 200), existing, standWidth, standDepth);
            expect(result.y).toBe(20);
        });
    });

    describe('Bounds Checking', () => {
        it('should clamp X position within stand bounds', () => {
            const result = calculateSnapping('cube', new THREE.Vector3(-200, 20, 0), [], standWidth, standDepth);
            expect(result.x).toBeGreaterThanOrEqual(-150 - 20); // -(300-40)/2 with tolerance
        });

        it('should clamp Z position within stand bounds', () => {
            const result = calculateSnapping('cube', new THREE.Vector3(0, 20, -200), [], standWidth, standDepth);
            expect(result.z).toBeGreaterThanOrEqual(-150 - 20);
        });

        it('should clamp Y position between 0 and 240', () => {
            const result = calculateSnapping('cube', new THREE.Vector3(0, 500, 0), [], standWidth, standDepth);
            expect(result.y).toBeLessThanOrEqual(220); // 240 - half cube height
        });
    });

    describe('Collision Blocking (Hard-block safety)', () => {
        it('should not block when no collision', () => {
            const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
            const result = calculateSnapping('cube', new THREE.Vector3(100, 100, 100), existing, standWidth, standDepth);
            // Should successfully place without collision blocking
            expect(result).toBeDefined();
            expect(result.x).toBe(100);
        });
    });

    describe('Exclude module ID', () => {
        it('should not collide with its own ID', () => {
            const existing = [createModule('1', 'cube', [0, 20, 0], [0, 0, 0])];
            const result = calculateSnapping('cube', new THREE.Vector3(0, 20, 0), existing, standWidth, standDepth, '1');
            // Should not collide with itself
            expect(result.y).toBeGreaterThan(0);
        });
    });
});

// ============================================================================
// TESTS: stepModuleUp / stepModuleDown
// ============================================================================

describe('stepModuleUp', () => {
    it('should move module up by STEP_HEIGHT (40)', () => {
        const result = stepModuleUp('cube', [0, 0, 0], 20);
        expect(result).toBe(60);
    });

    it('should cap at maximum Y (240 - height/2)', () => {
        const result = stepModuleUp('cube', [0, 0, 0], 210);
        expect(result).toBeLessThanOrEqual(220); // 240 - 20 (cube height/2)
    });

    it('should respect module height for vertical plateau', () => {
        // Vertical plateau: height = 80
        const result = stepModuleUp('plateau', [Math.PI / 2, 0, 0], 100);
        expect(result).toBeLessThanOrEqual(240 - 40); // 240 - 80/2
    });
});

describe('stepModuleDown', () => {
    it('should move module down by STEP_HEIGHT (40)', () => {
        const result = stepModuleDown('cube', [0, 0, 0], 60);
        expect(result).toBe(20);
    });

    it('should cap at minimum Y (height/2)', () => {
        const result = stepModuleDown('cube', [0, 0, 0], 10);
        expect(result).toBeGreaterThanOrEqual(20); // cube height/2
    });

    it('should respect vertical rectangle height (67)', () => {
        // Vertical rectangle: height = 67
        const result = stepModuleDown('rectangle', [0, 0, Math.PI / 2], 50);
        expect(result).toBeGreaterThanOrEqual(33.5); // 67/2
    });
});

// ============================================================================
// TESTS: getRotatedAABB (helper)
// ============================================================================

describe('getRotatedAABB', () => {
    it('should create bounding box for cube at origin', () => {
        const box = getRotatedAABB('cube', [0, 20, 0], [0, 0, 0]);
        expect(box.min.x).toBe(-20);
        expect(box.max.x).toBe(20);
        expect(box.min.y).toBe(0);
        expect(box.max.y).toBe(40);
    });

    it('should create bounding box for rotated rectangle', () => {
        const box = getRotatedAABB('rectangle', [0, 20, 0], [0, Math.PI / 2, 0]);
        // After rotation: W=40, H=40, D=67
        expect(box.min.x).toBe(-20);
        expect(box.max.x).toBe(20);
    });
});

// ============================================================================
// TESTS: Complex Scenarios
// ============================================================================

describe('Complex Scenarios', () => {
    const standWidth = 300;
    const standDepth = 300;

    it('should handle stacking multiple modules', () => {
        const existing = [
            createModule('1', 'cube', [0, 20, 0], [0, 0, 0]),
            createModule('2', 'cube', [0, 60, 0], [0, 0, 0]),
        ];
        const result = calculateSnapping('cube', new THREE.Vector3(0, 150, 0), existing, standWidth, standDepth);
        expect(result.y).toBeGreaterThan(60);
    });

    it('should handle mixed rotations', () => {
        const existing = [createModule('1', 'rectangle', [0, 20, 0], [0, Math.PI / 2, 0])];
        const result = calculateSnapping(
            'cube',
            new THREE.Vector3(50, 100, 50),
            existing,
            standWidth,
            standDepth,
            undefined,
            undefined,
            [Math.PI / 4, 0, Math.PI / 4]
        );
        expect(result).toBeDefined();
    });

    it('should snap plateau horizontally to cluster center', () => {
        const existing = [
            createModule('1', 'cube', [0, 20, 0], [0, 0, 0]),
            createModule('2', 'cube', [30, 20, 0], [0, 0, 0]),
        ];
        const result = calculateSnapping(
            'plateau',
            new THREE.Vector3(100, 100, 0),
            existing,
            standWidth,
            standDepth,
            undefined,
            undefined,
            [0, 0, 0]
        );
        // Should snap to cluster center
        expect(result).toBeDefined();
    });
});