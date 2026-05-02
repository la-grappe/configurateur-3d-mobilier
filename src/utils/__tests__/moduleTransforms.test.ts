/**
 * Unit Tests for moduleTransforms.ts
 * 
 * Tests all transformation functions:
 * - rotateModule() - Y-axis rotation
 * - toggleVertical() - X-axis and Z-axis rotation
 * - stepModuleUp/Down() - vertical movement
 * - getModuleHeight() - height calculation
 */

import {
    rotateModule,
    toggleVertical,
    stepModuleUp,
    stepModuleDown,
    getModuleHeight,
} from '../moduleTransforms';
import type { PlacedModule } from '../../store/useStore';

// ============================================================================
// Helper Functions
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

const expectApprox = (actual: number, expected: number, tolerance = 0.1) => {
    expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
};

// ============================================================================
// TESTS: rotateModule()
// ============================================================================

describe('rotateModule', () => {
    describe('Cube rotation', () => {
        it('should toggle rotation from 0 to π/2 on Y', () => {
            const cube = createModule('1', 'cube', [0, 20, 0], [0, 0, 0]);
            const rotated = rotateModule(cube);

            expect(rotated.rotation[1]).toBe(Math.PI / 2);
            expect(rotated.rotation[0]).toBe(0); // X unchanged
            expect(rotated.rotation[2]).toBe(0); // Z unchanged
        });

        it('should toggle rotation from π/2 back to 0 on Y', () => {
            const cube = createModule('1', 'cube', [0, 20, 0], [0, Math.PI / 2, 0]);
            const rotated = rotateModule(cube);

            expect(rotated.rotation[1]).toBe(0);
        });

        it('should keep Y-rotation at 0 if X or Z are non-zero', () => {
            const cube = createModule('1', 'cube', [0, 20, 0], [Math.PI / 4, 0, 0]);
            const rotated = rotateModule(cube);

            expect(rotated.rotation[1]).toBe(Math.PI / 2);
        });
    });

    describe('Rectangle rotation', () => {
        it('should toggle Y-rotation from 0 to π/2', () => {
            const rect = createModule('1', 'rectangle', [0, 20, 0], [0, 0, 0]);
            const rotated = rotateModule(rect);

            expect(rotated.rotation[1]).toBe(Math.PI / 2);
        });

        it('should toggle Y-rotation from π/2 back to 0', () => {
            const rect = createModule('1', 'rectangle', [0, 20, 0], [0, Math.PI / 2, 0]);
            const rotated = rotateModule(rect);

            expect(rotated.rotation[1]).toBe(0);
        });
    });

    describe('Plateau rotation', () => {
        it('should toggle Y-rotation from 0 to π/2', () => {
            const plateau = createModule('1', 'plateau', [0, 20, 0], [0, 0, 0]);
            const rotated = rotateModule(plateau);

            expect(rotated.rotation[1]).toBe(Math.PI / 2);
        });

        it('should toggle Y-rotation from π/2 back to 0', () => {
            const plateau = createModule('1', 'plateau', [0, 20, 0], [0, Math.PI / 2, 0]);
            const rotated = rotateModule(plateau);

            expect(rotated.rotation[1]).toBe(0);
        });
    });
});

// ============================================================================
// TESTS: toggleVertical()
// ============================================================================

describe('toggleVertical', () => {
    describe('Plateau vertical toggle', () => {
        it('should toggle horizontal plateau to vertical', () => {
            const plateau = createModule('1', 'plateau', [0, 1.25, 0], [0, 0, 0]);
            const toggled = toggleVertical(plateau);

            expect(toggled.rotation[0]).toBe(Math.PI / 2); // X now 90°
            expect(toggled.position[1]).toBe(40); // Moved up (1.25 + 40 - 1.25)
        });

        it('should toggle vertical plateau back to horizontal', () => {
            const plateau = createModule('1', 'plateau', [0, 41.25, 0], [Math.PI / 2, 0, 0]);
            const toggled = toggleVertical(plateau);

            expect(toggled.rotation[0]).toBe(0); // X back to 0
            // Y: was 41.25 (vertical center 80/2=40), goes to (41.25-40)+1.25 = 2.5
            expectApprox(toggled.position[1], 2.5, 0.5);
        });

        it('should preserve Y-rotation when toggling vertical', () => {
            const plateau = createModule('1', 'plateau', [0, 1.25, 0], [0, Math.PI / 2, 0]);
            const toggled = toggleVertical(plateau);

            expect(toggled.rotation[1]).toBe(Math.PI / 2); // Y preserved
        });
    });

    describe('Rectangle vertical toggle', () => {
        it('should toggle horizontal rectangle to vertical on Z', () => {
            const rect = createModule('1', 'rectangle', [0, 20, 0], [0, 0, 0]);
            const toggled = toggleVertical(rect);

            expect(toggled.rotation[2]).toBe(Math.PI / 2); // Z now 90°
            expectApprox(toggled.position[1], 20 + (67 / 2) - 20); // Y adjusted
        });

        it('should toggle vertical rectangle back to horizontal', () => {
            const rect = createModule('1', 'rectangle', [0, 53.5, 0], [0, 0, Math.PI / 2]);
            const toggled = toggleVertical(rect);

            expect(toggled.rotation[2]).toBe(0); // Z back to 0
            // Y: was 53.5 (vertical center 67/2=33.5), goes to (53.5-33.5)+20 = 40
            expectApprox(toggled.position[1], 40, 0.5);
        });
    });

    describe('Cube vertical toggle', () => {
        it('should toggle cube rotation on X axis', () => {
            const cube = createModule('1', 'cube', [0, 20, 0], [0, 0, 0]);
            const toggled = toggleVertical(cube);

            expect(toggled.rotation[0]).toBe(Math.PI / 2);
        });

        it('should toggle cube back to horizontal', () => {
            const cube = createModule('1', 'cube', [0, 20, 0], [Math.PI / 2, 0, 0]);
            const toggled = toggleVertical(cube);

            expect(toggled.rotation[0]).toBe(0);
        });

        it('should not change Y position for cube (symmetric)', () => {
            const cube = createModule('1', 'cube', [0, 20, 0], [0, 0, 0]);
            const toggled = toggleVertical(cube);

            expect(toggled.position[1]).toBe(20);
        });
    });
});

// ============================================================================
// TESTS: stepModuleUp()
// ============================================================================

describe('stepModuleUp', () => {
    it('should move cube up by STEP_HEIGHT (40)', () => {
        const newY = stepModuleUp('cube', [0, 0, 0], 20);
        expect(newY).toBe(60);
    });

    it('should move rectangle up by STEP_HEIGHT', () => {
        const newY = stepModuleUp('rectangle', [0, 0, 0], 100);
        expect(newY).toBe(140);
    });

    it('should cap at maximum Y', () => {
        const newY = stepModuleUp('cube', [0, 0, 0], 210); // Already high
        const maxY = 240 - 20; // MAX_MODULE_Y - height/2
        expect(newY).toBeLessThanOrEqual(maxY);
    });

    it('should respect vertical rectangle height (67)', () => {
        const maxY = stepModuleUp('rectangle', [0, 0, Math.PI / 2], 100);
        // Vertical rect height = 67, so max center Y = 240 - 33.5
        expect(maxY).toBeLessThanOrEqual(240 - 33.5);
    });

    it('should respect vertical plateau height (80)', () => {
        const maxY = stepModuleUp('plateau', [Math.PI / 2, 0, 0], 100);
        // Vertical plateau height = 80, so max center Y = 240 - 40
        expect(maxY).toBeLessThanOrEqual(200);
    });
});

// ============================================================================
// TESTS: stepModuleDown()
// ============================================================================

describe('stepModuleDown', () => {
    it('should move cube down by STEP_HEIGHT (40)', () => {
        const newY = stepModuleDown('cube', [0, 0, 0], 60);
        expect(newY).toBe(20);
    });

    it('should move rectangle down by STEP_HEIGHT', () => {
        const newY = stepModuleDown('rectangle', [0, 0, 0], 140);
        expect(newY).toBe(100);
    });

    it('should cap at minimum Y', () => {
        const newY = stepModuleDown('cube', [0, 0, 0], 10);
        const minY = 20; // MIN_MODULE_Y + height/2
        expect(newY).toBeGreaterThanOrEqual(minY);
    });

    it('should respect vertical plateau minimum', () => {
        const minY = stepModuleDown('plateau', [Math.PI / 2, 0, 0], 50);
        // Vertical plateau height = 80, so min center Y = 80/2 = 40
        expect(minY).toBeGreaterThanOrEqual(40);
    });
});

// ============================================================================
// TESTS: getModuleHeight()
// ============================================================================

describe('getModuleHeight', () => {
    it('should return 40 for cube (always symmetric)', () => {
        expect(getModuleHeight('cube', [0, 0, 0])).toBe(40);
        expect(getModuleHeight('cube', [Math.PI / 2, 0, 0])).toBe(40);
    });

    it('should return 40 for horizontal rectangle', () => {
        expect(getModuleHeight('rectangle', [0, 0, 0])).toBe(40);
    });

    it('should return 67 for vertical rectangle', () => {
        expect(getModuleHeight('rectangle', [0, 0, Math.PI / 2])).toBe(67);
    });

    it('should return 2.5 for horizontal plateau', () => {
        expect(getModuleHeight('plateau', [0, 0, 0])).toBe(2.5);
    });

    it('should return 80 for vertical plateau', () => {
        expect(getModuleHeight('plateau', [Math.PI / 2, 0, 0])).toBe(80);
    });

    it('should use rotation tolerance for near-vertical detection', () => {
        // Nearly vertical (within 0.1 rad tolerance)
        expect(getModuleHeight('plateau', [Math.PI / 2 + 0.05, 0, 0])).toBe(80);
        expect(getModuleHeight('plateau', [Math.PI / 2 - 0.05, 0, 0])).toBe(80);
    });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Module transformation sequences', () => {
    it('should handle rotation followed by vertical toggle', () => {
        let module = createModule('1', 'rectangle', [0, 20, 0], [0, 0, 0]);

        // Rotate 90° on Y
        module = rotateModule(module);
        expect(module.rotation[1]).toBe(Math.PI / 2);

        // Toggle vertical
        module = toggleVertical(module);
        expect(module.rotation[2]).toBe(Math.PI / 2);
    });

    it('should handle step up followed by vertical toggle', () => {
        let module = createModule('1', 'rectangle', [0, 20, 0], [0, 0, 0]);

        // Step up
        const newY = stepModuleUp('rectangle', module.rotation, module.position[1]);
        module = { ...module, position: [module.position[0], newY, module.position[2]] };
        expect(module.position[1]).toBe(60);

        // Toggle vertical (should adjust Y again)
        const beforeToggle = module.position[1];
        module = toggleVertical(module);
        expect(module.position[1]).not.toBe(beforeToggle); // Y should have changed
    });

    it('should preserve other axes when transforming', () => {
        let module = createModule('1', 'cube', [10, 20, 30], [0.1, 0.2, 0.3]);

        // Rotate on Y
        module = rotateModule(module);

        // X and Z should be unchanged
        expectApprox(module.rotation[0], 0.1);
        expectApprox(module.rotation[2], 0.3);
        expect(module.position[0]).toBe(10); // X unchanged
        expect(module.position[2]).toBe(30); // Z unchanged
    });

    it('should handle plateau full vertical cycle', () => {
        let module = createModule('1', 'plateau', [0, 1.25, 0], [0, 0, 0]);
        const originalPos = module.position[1];

        // Horizontal → Vertical
        module = toggleVertical(module);
        expect(module.rotation[0]).toBe(Math.PI / 2);
        expect(module.position[1]).toBeGreaterThan(originalPos);

        // Vertical → Horizontal
        module = toggleVertical(module);
        expect(module.rotation[0]).toBe(0);
        expectApprox(module.position[1], originalPos);
    });
});