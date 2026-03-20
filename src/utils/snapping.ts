import * as THREE from 'three';
import type { PlacedModule } from '../store/useStore';

export const MODULE_SIZES = {
  cube:      { width: 40,  height: 40,  depth: 40 },
  rectangle: { width: 67,  height: 40,  depth: 40 },
  plateau:   { width: 80,  height: 2.5, depth: 80 },
};

// How close (in cm) a face must be to another face to trigger snapping
// Step 2 uses a hardcoded 10cm threshold for Vertex Snapping
// const FACE_SNAP_THRESHOLD = 12; (Now removed)

/**
 * Helper: Calculates the 8 global corners of a module after applying rotation and position.
 */
export const getCorners = (
  type: 'cube' | 'rectangle' | 'plateau',
  position: [number, number, number] | THREE.Vector3,
  rotation: [number, number, number] = [0, 0, 0]
): THREE.Vector3[] => {
  const size = MODULE_SIZES[type];
  const p = position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position);
  
  const hw = size.width / 2;
  const hh = size.height / 2;
  const hd = size.depth / 2;
  
  const corners = [
    new THREE.Vector3(-hw, -hh, -hd),
    new THREE.Vector3( hw, -hh, -hd),
    new THREE.Vector3(-hw,  hh, -hd),
    new THREE.Vector3( hw,  hh, -hd),
    new THREE.Vector3(-hw, -hh,  hd),
    new THREE.Vector3( hw, -hh,  hd),
    new THREE.Vector3(-hw,  hh,  hd),
    new THREE.Vector3( hw,  hh,  hd),
  ];
  
  const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation));
  matrix.setPosition(p);
  
  return corners.map(c => c.applyMatrix4(matrix));
};

/**
 * Helper: Computes the Axis-Aligned Bounding Box (AABB) for a module in its current state.
 */
export const getRotatedAABB = (
  type: 'cube' | 'rectangle' | 'plateau',
  position: [number, number, number] | THREE.Vector3,
  rotation: [number, number, number]
): THREE.Box3 => {
  const points = getCorners(type, position, rotation);
  return new THREE.Box3().setFromPoints(points);
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
  box.expandByScalar(-0.5); // Shrink slightly to avoid edge-touch blocks
  
  for (const m of placedModules) {
    if (m.id === excludeId) continue;
    const mBox = getRotatedAABB(m.type, m.position, m.rotation);
    mBox.expandByScalar(-0.5);
    if (box.intersectsBox(mBox)) return true;
  }
  return false;
};
// ─────────────────────────────────────────────────────────────────────────────

/**
  * Core snapping calculation — IKEA Besta style.
 *
 * Step 1 – Automatic Surface Drop
 *   If the module's XZ footprint overlaps another module's footprint by more
 *   than 1 cm, the moving module rises to sit on top of it.
 *
 * Step 2 – Vertex Snapping (Distance euclidienne)
 *   Finds the pair of corners (one from the moving module, one from any placed module)
 *   with the smallest 3D distance. If < 10 cm, snaps the moving module to that corner.
 *
 * Step 3 – Collision hard-block
 *   Any remaining overlap reverts to safePosition.
 *
 * Step 4 – Height limit (240 cm) & stand bounds.
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
  
  // -- Current aabb to calculate footprint & base height --
  const myInitialAABB = getRotatedAABB(type, pos, rotation);
  
  // ── Step 1: Automatic Surface Drop (AABB overlap) ───────────────────────────
  let highestTop = 0;
  for (const m of placedModules) {
    if (m.id === excludeId) continue;
    
    const mAABB = getRotatedAABB(m.type, m.position, m.rotation);
    
    // Strict intersection: both XZ footprints must overlap by more than 1 cm
    const xOverlap = Math.min(myInitialAABB.max.x, mAABB.max.x) - Math.max(myInitialAABB.min.x, mAABB.min.x);
    const zOverlap = Math.min(myInitialAABB.max.z, mAABB.max.z) - Math.max(myInitialAABB.min.z, mAABB.min.z);
    
    if (xOverlap > 1 && zOverlap > 1) {
      highestTop = Math.max(highestTop, mAABB.max.y);
    }
  }
  
  // Adjust Y to sit on top of the stack (keeping its rotated profile)
  const myHeightOffsetFromBottom = pos.y - myInitialAABB.min.y;
  pos.y = highestTop + myHeightOffsetFromBottom;
  
  // ── Step 2: Vertex Snapping (Min Euclidean Distance < 10cm) ──────────────────
  if (type !== 'plateau') {
    let minDistSq = 100; // 10 cm squared
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

  // ── Step 4: Ground-Y & Bounds Correction ────────────────────────────────────
  // We apply corrections before Step 3 (Collision) so we check if the corrected pos is valid.
  let finalAABB = getRotatedAABB(type, pos, rotation);
  
  // Slip under grid fix: force min.y to 0
  if (finalAABB.min.y < -0.1) {
    pos.y -= finalAABB.min.y;
    finalAABB = getRotatedAABB(type, pos, rotation);
  }
  
  // Ceiling check: force max.y to 240
  if (finalAABB.max.y > 240) {
    pos.y -= (finalAABB.max.y - 240);
    finalAABB = getRotatedAABB(type, pos, rotation);
  }
  
  // XZ Boundaries
  const halfW = standWidth / 2;
  const halfD = standDepth / 2;
  if (finalAABB.min.x < -halfW) pos.x += (-halfW - finalAABB.min.x);
  if (finalAABB.max.x > halfW)  pos.x -= (finalAABB.max.x - halfW);
  if (finalAABB.min.z < -halfD) pos.z += (-halfD - finalAABB.min.z);
  if (finalAABB.max.z > halfD)  pos.z -= (finalAABB.max.z - halfD);

  // ── Step 3: Collision Check (Hard-block safety) ──────────────────────────────
  // Uses shrunk AABBs to prevent infinite blocking on adjacent edges
  const collisionBox = getRotatedAABB(type, pos, rotation);
  collisionBox.expandByScalar(-0.5); // Shrink slightly
  
  for (const m of placedModules) {
    if (m.id === excludeId) continue;
    const mAABB = getRotatedAABB(m.type, m.position, m.rotation);
    mAABB.expandByScalar(-0.5); 
    
    if (collisionBox.intersectsBox(mAABB)) {
      // If we collide and have a safePosition, go back to it
      if (safePosition) return safePosition.clone();
      
      // If no safePosition, just allow the correction but don't snap further?
      // For NEW modules (dragging), this blocks them in place.
      return new THREE.Vector3(rawPosition.x, Math.max(0, pos.y), rawPosition.z);
    }
  }

  return pos;
};

// ─── H / B Step helpers ──────────────────────────────────────────────────────

/** @deprecated */
export const calculateStepHeight = (
  _type: 'cube' | 'rectangle' | 'plateau',
  _rotation: [number, number, number],
  currentCenterY: number
): number => currentCenterY;

export const stepModuleUp = (
  type: 'cube' | 'rectangle' | 'plateau',
  rotation: [number, number, number],
  currentCenterY: number
): number => {
  const step = getStepSize(type, rotation);
  // Get current aabb height to know the top limit correctly
  const aabb = getRotatedAABB(type, [0, currentCenterY, 0], rotation);
  const halfH = (aabb.max.y - aabb.min.y) / 2;
  return Math.min(currentCenterY + step, 240 - halfH);
};

export const stepModuleDown = (
  type: 'cube' | 'rectangle' | 'plateau',
  rotation: [number, number, number],
  currentCenterY: number
): number => {
  const step = getStepSize(type, rotation);
  const aabb = getRotatedAABB(type, [0, currentCenterY, 0], rotation);
  const halfH = (aabb.max.y - aabb.min.y) / 2;
  return Math.max(currentCenterY - step, halfH);
};

function getStepSize(
  type: 'cube' | 'rectangle' | 'plateau',
  rotation: [number, number, number]
): number {
  if (type === 'rectangle' && Math.abs(rotation[2]) > 0.1) return 67;
  return 40;
}
