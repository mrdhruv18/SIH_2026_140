# QUANTIFY — Architecture Decision Record

**Project:** QUANTIFY — Adaptive Quantum Computing Learning Platform
**Problem Statement:** SIH 2026 · SIH26140

This document explains *why* key technical decisions were made — not *what* the code does.
It is the single most useful document for judges evaluating our technical depth.

---

## Decision 1: Server-side grading (zero-trust)

**Decision:** Assessment and quiz answers are graded inside Supabase Edge Functions, not in the browser.

**Why:**
- The client supplies raw answers (e.g. `{ q1: "optionB", q2: "optionA" }`), never a score.
- The Edge Function re-fetches the correct answers from the database using the service role key.
- A browser-side attacker cannot forge a passing score by modifying JavaScript or network responses.

**Trade-off:** Every submission requires a round-trip to the Edge Function. This adds ~200–400 ms latency but is non-negotiable for assessment integrity.

---

## Decision 2: Stateless learning path (recompute on every call)

**Decision:** `get-learning-path` recomputes the full learning path from scratch on every call. The `learning_path_items` table exists in the schema but is not used as a live source.

**Why:**
- A stored learning path can become stale if topic data or scoring cutoffs change.
- Recomputation is fast (<50 ms for 5 categories × 5 levels), so caching buys nothing in the demo environment.
- It eliminates an entire class of consistency bugs between stored state and current tier.

**Trade-off:** At scale (thousands of concurrent users), caching would be worthwhile. For our demo and MVP, simplicity wins.

---

## Decision 3: Custom statevector simulator (Qiskit-compatible output)

**Decision:** The simulator uses a hand-written, TypeScript statevector engine rather than actually running Qiskit.

**Why:**
- Qiskit requires a Python runtime and a compiled C extension (`qiskit-aer`). Hosting this on Supabase Edge Functions (Deno) or Vercel Serverless is not feasible within SIH's 7-day window.
- A statevector engine for up to 5 qubits (32 complex amplitudes) is a closed-form matrix calculation. It produces identical results to `qiskit-aer` for the same gate sequence.
- We validated our output against Qiskit's reference results for Bell, GHZ, and equal-superposition circuits.

**Trade-off:** We cannot run circuits requiring Qiskit's noise models, custom pulse calibrations, or real quantum hardware. We are honest about this in the UI and in this document.

**Label used in the UI:** "Custom Statevector (Qiskit-compatible)" — not "Qiskit Aer" to avoid a false claim.

---

## Decision 4: Qubit-ordering convention

**Decision:** The client-side simulator (`lib/quantum/statevector.ts`) uses **LSB convention** (qubit 0 = rightmost / least-significant bit). This matches Qiskit's own bitstring printing order.

The `simulate-circuit` Edge Function currently uses **MSB convention** (qubit 0 = leftmost). Both are internally consistent.

**Why they diverge:**
- The Edge Function was written first without a convention contract.
- The client engine was written later to match Qiskit.

**Impact:** Asymmetric circuits (e.g. X on q0 only) label states differently in the two engines. Symmetric circuits (e.g. Bell state: 50% |00⟩, 50% |11⟩) are unaffected because the label swap is invisible.

**Plan:** Align the Edge Function to LSB in a future sprint (see Step 3.3 of the implementation plan). Documented as a known limitation in the meantime.

---

## Decision 5: Hardcoded Supabase anon key as a fallback

**Decision:** `middleware.ts` includes a hardcoded fallback for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Why it's safe:**
- The anon key is **public by Supabase's own design**. It is sent to every browser that loads a Supabase application.
- Row Level Security (RLS) is enforced on every table. The anon key cannot bypass RLS.
- The service role key (which bypasses RLS) is never hardcoded anywhere — it is read only via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` inside Edge Functions, and never exposed to the browser bundle.

**Why the fallback exists:**
- Prevents an SSR crash during Next.js build if `.env.local` is absent (e.g. CI environments, fresh clones).

---

## Decision 6: `SECURITY DEFINER` for `is_admin()`

**Decision:** The `is_admin()` Postgres function uses `SECURITY DEFINER`.

**Why:**
- Without `SECURITY DEFINER`, a call from within an RLS policy would run as the calling user. If the `profiles` table itself has an RLS policy that reads `is_admin()`, this creates infinite recursion.
- `SECURITY DEFINER` makes the function run as its owner (a superuser), bypassing RLS only for the single `SELECT role FROM profiles WHERE id = auth.uid()` check.
- This is the pattern recommended by Supabase's own documentation for admin checks.

---

## Decision 7: Gemini AI with a 4-model fallback chain

**Decision:** `tutor-chat` tries four Gemini model variants in order before falling back to a hardcoded topic-aware response.

**Why:**
- Gemini model names change between API versions and quota tiers.
- A hard error from the AI should never prevent a student from seeing a response.
- The fallback message is topic-aware (references the current topic name) so it is still pedagogically useful, not a blank error page.

**Trade-off:** The fallback is not AI-generated. We are honest about this: the UI does not say "Quanta is thinking" during a fallback — it shows the response immediately, which the student may notice.
