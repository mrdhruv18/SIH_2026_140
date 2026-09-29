// ==============================================================================
// QUANTIFY — lib/quantum/complex.ts
// ==============================================================================
// Complex number type and arithmetic helpers used by the statevector engine.
//
// WHY: All quantum amplitudes are complex numbers α ∈ ℂ. Keeping them typed
// rather than as plain {r,i} objects lets TypeScript catch mismatched operands
// and makes the gate-application code self-documenting.
// ==============================================================================

/** A complex number represented as real + imaginary components. */
export interface Complex {
  /** Real part */
  r: number
  /** Imaginary part */
  i: number
}

/** Complex addition: (a + bi) + (c + di) = (a+c) + (b+d)i */
export function add(a: Complex, b: Complex): Complex {
  return { r: a.r + b.r, i: a.i + b.i }
}

/** Complex multiplication: (a + bi)(c + di) = (ac − bd) + (ad + bc)i */
export function mul(a: Complex, b: Complex): Complex {
  return { r: a.r * b.r - a.i * b.i, i: a.r * b.i + a.i * b.r }
}

/** |z|² = r² + i²  (measurement probability without the square-root) */
export function magnitudeSquared(a: Complex): number {
  return a.r * a.r + a.i * a.i
}

/** The zero amplitude: |amplitude| = 0 */
export const ZERO: Complex = { r: 0, i: 0 }

/** The unit amplitude: |amplitude| = 1, phase = 0 */
export const ONE: Complex = { r: 1, i: 0 }
