import * as THREE from 'three';
import type { PlacedModule } from '../store/useStore';

export const MODULE_SIZES = {
  cube: { width: 40, height: 40, depth: 40 },
  rectangle: { width: 67, height: 40, depth: 40 },
  plateau: { width: 80, height: 2.5, depth: 80 },
};

/**
 * Robustly calculates occupied dimensions (AABB) for orthogonal 90-degree rotations.
 * Order: YXZ (matches Scene application)
 */
export const getModuleAABBDimensions = (type: 'cube' | 'rectangle' | 'plateau', rotation: [number, number, number] | THREE.Euler) => {
  const baseSize = MODULE_SIZES[type];
  let w = baseSize.width;
  let h = baseSize.height;
  let d = baseSize.depth;

  const rotArray = rotation instanceof THREE.Euler ? [rotation.x, rotation.y, rotation.z] : rotation;
  const turns = rotArray.map(r => Math.abs(Math.round(r / (Math.PI / 2))) % 4);

  // 1. Horizontal rotation (Spin around Y)
  if (turns[1] === 1 || turns[1] === 3) {
    [w, d] = [d, w];
  }
  // 2. Front/Back flip (X axis)
  if (turns[0] === 1 || turns[0] === 3) {
    [h, d] = [d, h];
  }
  // 3. Side flip (Z axis)
  if (turns[2] === 1 || turns[2] === 3) {
    [w, h] = [h, w];
  }

  return { trueW: w, trueH: h, trueD: d };
};

/**
 * Calculates the 8 global corners of a module.
 */
export const getCorners = (
  type: 'cube' | 'rectangle' | 'plateau',
  position: [number, number, number] | THREE.Vector3,
  rotation: [number, number, number] = [0, 0, 0]
): THREE.Vector3[] => {
  const size = MODULE_SIZES[type];
  const hw = size.width / 2;
  const hh = size.height / 2;
  const hd = size.depth / 2;
  const p = position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position);

  const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2], 'YXZ');

  const corners = [
    new THREE.Vector3(-hw, -hh, -hd),
    new THREE.Vector3(hw, -hh, -hd),
    new THREE.Vector3(-hw, hh, -hd),
    new THREE.Vector3(hw, hh, hd),
    new THREE.Vector3(-hw, -hh, hd),
    new THREE.Vector3(hw, -hh, hd),
    new THREE.Vector3(-hw, hh, hd),
    new THREE.Vector3(hw, hh, hd),
  ];

  return corners.map(c => c.applyEuler(euler).add(p));
};

/**
 * Helper: Computes the Axis-Aligned Bounding Box (AABB) using the robust logic.
 */
export const getRotatedAABB = (
  type: 'cube' | 'rectangle' | 'plateau',
  position: [number, number, number] | THREE.Vector3,
  rotation: [number, number, number]
): THREE.Box3 => {
  const { trueW, trueH, trueD } = getModuleAABBDimensions(type, rotation);
  const p = position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position);
  return new THREE.Box3(
    new THREE.Vector3(p.x - trueW / 2, p.y - trueH / 2, p.z - trueD / 2),
    new THREE.Vector3(p.x + trueW / 2, p.y + trueH / 2, p.z + trueD / 2)
  );
};

/**
 * Returns true if placing `type` at `position` overlaps any placed module.
 */
export const hasCollisionAtPosition = (
  type: 'cube' | 'rectangle' | 'plateau',
  position: [number, number, number] | THREE.Vector3,
  placedModules: PlacedModule[],
  excludeId?: string,
  rotation: [number, number, number] = [0, 0, 0]
): boolean => {
  const box = getRotatedAABB(type, position, rotation);
  box.expandByScalar(-0.5);

  for (const m of placedModules) {
    if (m.id === excludeId) continue;
    const mBox = getRotatedAABB(m.type, m.position, m.rotation);
    mBox.expandByScalar(-0.5);
    if (box.intersectsBox(mBox)) return true;
  }
  return false;
};

/**
 * Core IKEA-style snapping logic.
 */
export const calculateSnapping = (
  type: 'cube' | 'rectangle' | 'plateau',
  rawPosition: THREE.Vector3,
  placedModules: PlacedModule[],
  standWidth: number,
  standDepth: number,
  excludeId?: string,
  safePosition?: THREE.Vector3,
  rotation: [number, number, number] = [0, 0, 0]
): THREE.Vector3 => {
  let pos = rawPosition.clone();

  const { trueW, trueH, trueD } = getModuleAABBDimensions(type, rotation);

  // ── Step 1: Automatic Surface Drop ──────────────────────────────────────────
  let highestTop = 0;
  const myMinX = pos.x - trueW / 2;
  const myMaxX = pos.x + trueW / 2;
  const myMinZ = pos.z - trueD / 2;
  const myMaxZ = pos.z + trueD / 2;

  for (const m of placedModules) {
    if (m.id === excludeId) continue;

    const { trueW: mW, trueH: mH, trueD: mD } = getModuleAABBDimensions(m.type, m.rotation);
    const mMinX = m.position[0] - mW / 2;
    const mMaxX = m.position[0] + mW / 2;
    const mMinZ = m.position[2] - mD / 2;
    const mMaxZ = m.position[2] + mD / 2;

    // Check footprint overlap
    const xOverlap = Math.min(myMaxX, mMaxX) - Math.max(myMinX, mMinX);
    const zOverlap = Math.min(myMaxZ, mMaxZ) - Math.max(myMinZ, mMinZ);

    if (xOverlap > 1 && zOverlap > 1) {
      highestTop = Math.max(highestTop, m.position[1] + mH / 2);
    }
  }

  pos.y = highestTop + trueH / 2;

  // ── Plateau Specific Logic ──────────────────────────────────────────────────
  if (type === 'plateau') {
    const isHorizontal = trueH < 10;
    const isVertical = trueH >= 10;

    if (isHorizontal) {
      // Rule 1: Point to center of supporting cluster
      const modulesBelow = placedModules.filter(m => {
        if (m.id === excludeId) return false;
        const { trueW: mW, trueH: mH, trueD: mD } = getModuleAABBDimensions(m.type, m.rotation);
        const isAtCorrectHeight = Math.abs((m.position[1] + mH / 2) - (pos.y - trueH / 2)) < 1.0;
        if (!isAtCorrectHeight) return false;

        const xOverlap = Math.min(myMaxX, m.position[0] + mW / 2) - Math.max(myMinX, m.position[0] - mW / 2);
        const zOverlap = Math.min(myMaxZ, m.position[2] + mD / 2) - Math.max(myMinZ, m.position[2] - mD / 2);
        return (xOverlap > 1 && zOverlap > 1);
      });

      if (modulesBelow.length > 0) {
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        modulesBelow.forEach(m => {
          const { trueW: mW, trueD: mD } = getModuleAABBDimensions(m.type, m.rotation);
          minX = Math.min(minX, m.position[0] - mW / 2);
          maxX = Math.max(maxX, m.position[0] + mW / 2);
          minZ = Math.min(minZ, m.position[2] - mD / 2);
          maxZ = Math.max(maxZ, m.position[2] + mD / 2);
        });
        pos.x = (minX + maxX) / 2;
        pos.z = (minZ + maxZ) / 2;
      }
    } else if (isVertical) {
      // Rule 2: Face Snapping
      let bestXDelta = 0, bestZDelta = 0;
      let minDeltaX = 10, minDeltaZ = 10;

      for (const m of placedModules) {
        if (m.id === excludeId) continue;
        const { trueW: mW, trueD: mD } = getModuleAABBDimensions(m.type, m.rotation);
        const mMinX = m.position[0] - mW / 2;
        const mMaxX = m.position[0] + mW / 2;
        const mMinZ = m.position[2] - mD / 2;
        const mMaxZ = m.position[2] + mD / 2;

        if (trueW < 10) { // Wall facing X
          const d1 = Math.abs((pos.x - trueW / 2) - mMaxX);
          if (d1 < minDeltaX) { minDeltaX = d1; bestXDelta = mMaxX + trueW / 2 - pos.x; }
          const d2 = Math.abs((pos.x + trueW / 2) - mMinX);
          if (d2 < minDeltaX) { minDeltaX = d2; bestXDelta = mMinX - trueW / 2 - pos.x; }
        }
        if (trueD < 10) { // Wall facing Z
          const d1 = Math.abs((pos.z - trueD / 2) - mMaxZ);
          if (d1 < minDeltaZ) { minDeltaZ = d1; bestZDelta = mMaxZ + trueD / 2 - pos.z; }
          const d2 = Math.abs((pos.z + trueD / 2) - mMinZ);
          if (d2 < minDeltaZ) { minDeltaZ = d2; bestZDelta = mMinZ - trueD / 2 - pos.z; }
        }
      }
      if (minDeltaX < 10 && minDeltaX <= minDeltaZ) pos.x += bestXDelta;
      else if (minDeltaZ < 10) pos.z += bestZDelta;

      // Rule 3: Vertical Y alignment
      const snappedMinY = Math.round((pos.y - trueH / 2) / 40) * 40;
      if (Math.abs((pos.y - trueH / 2) - snappedMinY) < 10) {
        pos.y = snappedMinY + trueH / 2;
      }
    }
  }

  // ── Step 2: Vertex Snapping (for Cubes/Rects) ───────────────────────────────
  if (type !== 'plateau') {
    let minDistSq = 100;
    let bestOffset: THREE.Vector3 | null = null;
    const myCorners = getCorners(type, pos, rotation);

    for (const m of placedModules) {
      if (m.id === excludeId) continue;
      const mCorners = getCorners(m.type, m.position, m.rotation);
      for (const myC of myCorners) {
        for (const targetC of mCorners) {
          const dSq = myC.distanceToSquared(targetC);
          if (dSq < minDistSq) {
            minDistSq = dSq;
            bestOffset = targetC.clone().sub(myC);
          }
        }
      }
    }
    if (bestOffset) {
      pos.add(bestOffset);
    }
  }

  // ── Step 4: Stand Bounds Correction ─────────────────────────────────────────
  if (pos.y - trueH / 2 < -0.1) pos.y = trueH / 2;
  if (pos.y + trueH / 2 > 240) pos.y = 240 - trueH / 2;

  const maxXLimit = (standWidth - trueW) / 2;
  const maxZLimit = (standDepth - trueD) / 2;
  pos.x = THREE.MathUtils.clamp(pos.x, -maxXLimit, maxXLimit);
  pos.z = THREE.MathUtils.clamp(pos.z, -maxZLimit, maxZLimit);

  // ── Step 3: Collision Check (Hard-block safety) ──────────────────────────────
  const collisionBox = getRotatedAABB(type, pos, rotation);
  collisionBox.expandByScalar(-0.5);

  for (const m of placedModules) {
    if (m.id === excludeId) continue;
    const mBox = getRotatedAABB(m.type, m.position, m.rotation);
    mBox.expandByScalar(-0.5);
    if (collisionBox.intersectsBox(mBox)) {
      if (safePosition) return safePosition.clone();
      return new THREE.Vector3(rawPosition.x, Math.max(trueH / 2, pos.y), rawPosition.z);
    }
  }

  return pos;
};

export const stepModuleUp = (
  type: 'cube' | 'rectangle' | 'plateau',
  rotation: [number, number, number],
  currentCenterY: number
): number => {
  const step = 40; // Standard step height
  const { trueH } = getModuleAABBDimensions(type, rotation);
  return Math.min(currentCenterY + step, 240 - trueH / 2);
};

export const stepModuleDown = (
  type: 'cube' | 'rectangle' | 'plateau',
  rotation: [number, number, number],
  currentCenterY: number
): number => {
  const step = 40;
  const { trueH } = getModuleAABBDimensions(type, rotation);
  return Math.max(currentCenterY - step, trueH / 2);
};
