/**
 * Unit Tests for snapping.ts
 * 
 * Tests the core mathematical functions for:
 * - Module dimension calculation after rotation (getModuleAABBDimensions)
 * - Collision detection (hasCollisionAtPosition)
 * - Vertex snapping and surface drop (calculateSnapping)
 * - Step up/down movements (stepModuleUp, stepModuleDown)
 */

import * as THREE from 'three';
import {
    getModuleAABBDimensions,
    getCorners,
    getRotatedAABB,
    hasCollisionAtPosition,
    calculateSnapping,
    stepModuleUp,
    stepModuleDown,
    MODULE_SIZES,
} from '../snapping';
import type { PlacedModule } from '../../store/useStore';

// ============================================================================
// Helper Functions for Tests
// ============================================================================

/**
 * Create a test module with default values
 */
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

/**
 * Assert that two numbers are approximately equal (within tolerance)
 */
const expectApprox = (actual: number, expected: number, tolerance = 0.01) => {
    expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
};

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

        it('should handle double rotation (Y then Z)', () => {
            const result = getModuleAABBDimensions('rectangle', [0, Math.PI / 2, Math.PI / 2]);
            // W: 67→40 (Y rotation), then 40→67 (Z rotation) = 67
            // H: 40 (no X rotation)
            // D: 40→67 (Y rotation), then stays 67 = 67
            expect(result).toEqual({ trueW: 67, trueH: 40, trueD: 67 });
        });
    });

    describe('Plateau (80x2.5x80, horizontal vs vertical)', () => {
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
            const result = getModuleAABBDimensions('cube', [0.05, 0, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
        });

        it('should treat near-90° rotation as 90° (tolerance 0.1 rad)', () => {
            const result = getModuleAABBDimensions('cube', [Math.PI / 2 + 0.05, 0, 0]);
            expect(result).toEqual({ trueW: 40, trueH: 40, trueD: 40 });
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
        const modules: PlacedModule[] = [
            createModule('1', 'cube', [0, 20, 0]),
        ];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], modules);
        expect(result).toBe(true);
    });

    it('should return false when placing cube far away from others', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'cube', [0, 20, 0]),
        ];
        const result = hasCollisionAtPosition('cube', [200, 200, 200], modules);
        expect(result).toBe(false);
    });

    it('should exclude specified module ID', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'cube', [0, 20, 0]),
        ];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], modules, '1');
        expect(result).toBe(false);
    });

    it('should detect collision with rotated module', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'rectangle', [0, 20, 0], [0, Math.PI / 2, 0]),
        ];
        const result = hasCollisionAtPosition('cube', [0, 20, 0], modules);
        expect(result).toBe(true);
    });

    it('should handle multiple modules', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'cube', [0, 20, 0]),
            createModule('2', 'cube', [100, 20, 0]),
            createModule('3', 'cube', [200, 20, 0]),
        ];
        // Collides with module 2
        const result = hasCollisionAtPosition('cube', [100, 20, 0], modules);
        expect(result).toBe(true);
    });

    it('should use provided rotation for collision check', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'rectangle', [0, 20, 0]),
        ];
        // Cube rotated should still collide
        const result = hasCollisionAtPosition(
            'cube',
            [0, 20, 0],
            modules,
            undefined,
            [Math.PI / 2, 0, 0]
        );
        expect(result).toBe(true);
    });
});

// ============================================================================
// TESTS: calculateSnapping
// ============================================================================

describe('calculateSnapping', () => {
    describe('Surface Drop (automatic Y positioning)', () => {
        it('should place cube on ground when empty scene', () => {
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(0, 0, 0),
                [],
                300,
                300
            );
            expect(result.y).toBe(20); // cube height/2 = 40/2 = 20
        });

        it('should stack cube on top of another cube', () => {
            const modules: PlacedModule[] = [
                createModule('1', 'cube', [0, 20, 0]),
            ];
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(0, 0, 0),
                modules,
                300,
                300
            );
            // Module 1 top = 20 + 20 = 40, so cube center = 40 + 20 = 60
            expect(result.y).toBe(60);
        });

        it('should stack rectangle on top of cube', () => {
            const modules: PlacedModule[] = [
                createModule('1', 'cube', [0, 20, 0]),
            ];
            const result = calculateSnapping(
                'rectangle',
                new THREE.Vector3(0, 0, 0),
                modules,
                300,
                300
            );
            // Cube top = 40, rectangle center = 40 + 20 = 60
            expect(result.y).toBe(60);
        });

        it('should respect footprint overlap for surface drop', () => {
            const modules: PlacedModule[] = [
                createModule('1', 'cube', [0, 20, 0]),
                createModule('2', 'cube', [100, 20, 0]), // Far away
            ];
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(200, 0, 0),
                modules,
                300,
                300
            );
            // Should land on ground (Y=20), not on the other cubes
            expect(result.y).toBe(20);
        });
    });

    describe('Bounds Checking', () => {
        it('should clamp X position within stand bounds', () => {
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(500, 20, 0), // Beyond stand width
                [],
                300,
                300
            );
            const maxX = (300 - 40) / 2; // (standWidth - moduleWidth) / 2
            expectApprox(result.x, maxX, 1);
        });

        it('should clamp Z position within stand bounds', () => {
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(0, 20, 500), // Beyond stand depth
                [],
                300,
                300
            );
            const maxZ = (300 - 40) / 2; // (standDepth - moduleDepth) / 2
            expectApprox(result.z, maxZ, 1);
        });

        it('should clamp Y position between 0 and 240', () => {
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(0, 500, 0),
                [],
                300,
                300
            );
            expect(result.y).toBeLessThanOrEqual(240 - 20);
        });
    });

    describe('Collision Blocking (Hard-block safety)', () => {
        it('should return safe position when collision detected', () => {
            const modules: PlacedModule[] = [
                createModule('1', 'cube', [0, 20, 0]),
            ];
            const safePos = new THREE.Vector3(100, 20, 0);
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(0, 20, 0), // Would collide
                modules,
                300,
                300,
                undefined,
                safePos
            );
            expect(result.x).toBe(safePos.x);
            expect(result.y).toBe(safePos.y);
            expect(result.z).toBe(safePos.z);
        });

        it('should not block when no collision', () => {
            const modules: PlacedModule[] = [
                createModule('1', 'cube', [0, 20, 0]),
            ];
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(100, 20, 0), // No collision
                modules,
                300,
                300
            );
            // Should move to the target position, not blocked
            expect(Math.abs(result.x - 100)).toBeLessThan(5); // Allow small drift
        });
    });

    describe('Exclude module ID', () => {
        it('should not collide with its own ID', () => {
            const modules: PlacedModule[] = [
                createModule('1', 'cube', [0, 20, 0]),
            ];
            const result = calculateSnapping(
                'cube',
                new THREE.Vector3(0, 20, 0),
                modules,
                300,
                300,
                '1' // Exclude module 1
            );
            // Should not be blocked by itself
            expect(result.x).toBe(0);
        });
    });
});

// ============================================================================
// TESTS: stepModuleUp / stepModuleDown
// ============================================================================

describe('stepModuleUp', () => {
    it('should move module up by STEP_HEIGHT', () => {
        const newY = stepModuleUp('cube', [0, 0, 0], 20);
        expect(newY).toBe(60); // 20 + 40
    });

    it('should cap at maximum Y', () => {
        const newY = stepModuleUp('cube', [0, 0, 0], 200);
        const maxY = 240 - 20; // MAX_MODULE_Y - height/2
        expect(newY).toBeLessThanOrEqual(maxY);
    });

    it('should respect module height', () => {
        // Plateau vertical (height = 80)
        const newY = stepModuleUp('plateau', [Math.PI / 2, 0, 0], 100);
        expect(newY).toBeLessThanOrEqual(240 - 40); // maxY - height/2
    });
});

describe('stepModuleDown', () => {
    it('should move module down by STEP_HEIGHT', () => {
        const newY = stepModuleDown('cube', [0, 0, 0], 60);
        expect(newY).toBe(20); // 60 - 40
    });

    it('should cap at minimum Y', () => {
        const newY = stepModuleDown('cube', [0, 0, 0], 10);
        const minY = 20; // height/2
        expect(newY).toBeGreaterThanOrEqual(minY);
    });
});

// ============================================================================
// TESTS: Vertex Snapping (for Cubes and Rectangles)
// ============================================================================

describe('Vertex Snapping', () => {
    it('should snap cube corners to existing module corners', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'cube', [0, 20, 0]),
        ];
        const result = calculateSnapping(
            'cube',
            new THREE.Vector3(20.5, 20, 0), // Slightly offset
            modules,
            300,
            300
        );
        // Should snap to vertex alignment
        expect(Math.abs(result.x)).toBeLessThan(1); // Very close to 0
    });

    it('should not snap if distance is too large', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'cube', [0, 20, 0]),
        ];
        const result = calculateSnapping(
            'cube',
            new THREE.Vector3(200, 20, 0), // Far away
            modules,
            300,
            300
        );
        // Should stay near target position, not snap
        expect(Math.abs(result.x - 200)).toBeLessThan(10);
    });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Complex Scenarios', () => {
    it('should handle stacking multiple modules', () => {
        let modules: PlacedModule[] = [];

        // Place cube 1 at ground
        const cube1Pos = calculateSnapping(
            'cube',
            new THREE.Vector3(0, 0, 0),
            modules,
            300,
            300
        );
        modules.push(createModule('1', 'cube', [cube1Pos.x, cube1Pos.y, cube1Pos.z]));

        // Place cube 2 on top
        const cube2Pos = calculateSnapping(
            'cube',
            new THREE.Vector3(0, 0, 0),
            modules,
            300,
            300
        );
        modules.push(createModule('2', 'cube', [cube2Pos.x, cube2Pos.y, cube2Pos.z]));

        // Place rectangle on top
        const rectPos = calculateSnapping(
            'rectangle',
            new THREE.Vector3(0, 0, 0),
            modules,
            300,
            300
        );

        // Rectangle should be stacked properly
        expect(rectPos.y).toBeGreaterThan(cube2Pos.y);
    });

    it('should handle mixed rotations', () => {
        const modules: PlacedModule[] = [
            createModule('1', 'rectangle', [0, 20, 0], [0, Math.PI / 2, 0]),
            createModule('2', 'plateau', [50, 20, 0], [Math.PI / 2, 0, 0]),
        ];

        const result = calculateSnapping(
            'cube',
            new THREE.Vector3(25, 0, 0),
            modules,
            300,
            300
        );

        // Should find a valid position without collision
        expect(
            hasCollisionAtPosition('cube', [result.x, result.y, result.z], modules)
        ).toBe(false);
    });
});