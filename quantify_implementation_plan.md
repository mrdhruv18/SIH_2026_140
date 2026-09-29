## SIH 2026 · PROBLEM STATEMENT SIH26140

## QUANTIFY

Implementation Plan — Phases 2, 3 & 4

Prepared for: Kavya Chandegara — Project Lead & Frontend Engineering

Purpose: Step-by-step plan to refactor for ownership, strengthen and test the codebase, and prepare the demo and

defense, without breaking working features.

Builds on: Phase 1 Deep-Dive and the Phase 1 implementation summary

Phases: 2 Ownership refactor · 3 Strengthen · 4 Demo readiness


## Table of Contents

0. Where You Are Right Now 1. Roadmap Overview 2. Phase 2, Ownership Refactor 2.1 Working method (do this before touching code) 2.2 Naming conventions (decide once, write it down) 2.3 Step-by-step refactor targets 2.4 Phase 2 done when 3. Phase 3, Strengthen 3.1 Test infrastructure (do this first, before Phase 2) 3.2 Simulator test suite (highest value) 3.3 Align qubit-order between client and server [URL 🔗](file:///home/claude/plan/final.html#naming-conventions-decide-once-write-it-down)

[3.4 save-circuit ownership check](file:///home/claude/plan/final.html#save-circuit-ownership-check)

3.5 Input validation in Edge Functions 3.6 Grading and path logic tests 3.7 Reduce any 3.8 Decide how you describe “Qiskit Aer” 3.9 Secrets and configuration 3.10 Documentation you write yourselves 3.11 CI (small and worth it) 3.12 Phase 3 done when 4. Phase 4, Demo Readiness and Defense 4.1 Deployment run-through 4.2 Demo script (5-7 minutes) 4.3 Failure fallbacks 4.4 Defense drills 4.5 Final freeze 5. Suggested Schedule 6. Recommended Execution Order 7. Regression Checklist (run after every refactor step) 8. Risk Register [URL 🔗](file:///home/claude/plan/final.html#regression-checklist-run-after-every-refactor-step)

[9. Quick Command Reference](file:///home/claude/plan/final.html#quick-command-reference)


## 0. Where You Are Right Now

Phase 1 (understand the codebase) is done. Your IDE agent has also applied a first batch of changes and reported tsc --noEmit at 0 errors. Before planning forward, here is the honest state of that batch, checked against the original zip.

| Typed any TutorGate Comment block in fallback keys simulators “SWAP gate bug fixed” “ save-circuit | Item from the summary Verified status Action tutor-chat payload, removed 5 as Plausible, low risk Re-run tsc and test the tutor once in the browser type in lib/api/tutor.ts Plausible, low risk Same as above middleware.ts about Fine Reword to “safe because RLS is on every table” Qubit-order convention documented in both Documentation only, not alignment Real alignment is Step 3.3 below Not a bug. The original loop already wrote Do not claim it as a fix. Verify equivalence with both directions, because each partner index a test (Step 3.2) also has differing bits ownership check already Not true in the zip. Those lines are the plain Confirm in your local file. If missing, apply Step |
| --- | --- |
|   | implemented (lines 120-133)” upsert . The supabase/functions/ copy is 3.4 |
|   | a 2-line stub |

Other facts that shape the plan (found in the repo):

- There is no test framework installed. package.json has only dev , build , start , lint .

- There is no CI ( .github/workflows/ does not exist), and no deploy script.

- app/simulator/page.tsx is 725 lines with ~20 useState calls. It is the biggest single file and your named contribution.

- There are about 152 any occurrences across app/ , lib/ , components/ and backend/functions/ . The audit report only covered 9.

- The gate type is 'X'|'Y'|'Z'|'H'|'S'|'T'|'CNOT'|'SWAP'|'M' in types/quantify.ts , but the local PlacedGate inside save- circuit lists only X..CNOT . The types have drifted apart.

- The DEMO_DEPLOYMENT_CHECKLIST.md already exists and covers migrations and environment setup.

## 1. Roadmap Overview

| Phase | Goal | Output | Est. effort |
| --- | --- | --- | --- |
| 2. Ownership refactor | Structure, names and comments | Cleaner modules, one type source | 2-3 days |
|   | that reflect how your team thinks, | of truth, safety net of snapshot |   |
|   | with zero behavior change | tests |   |
| 3. Strengthen | Fix real gaps, add tests, validate | Test suite, hardened Edge | 3-4 days |
|   | inputs, write your own docs | Functions, CI, accurate README |   |
| 4. Demo readiness and | Be able to run and explain | Demo script, Q&A drills, rehearsed | 1-2 days |
| defense | everything live | fallbacks |   |

The one rule for all phases: never change behavior and structure in the same commit. Refactor commits must leave every test and every screen identical. Fix commits change behavior on purpose and say so in the message.

Recommended order inside the phases: write the safety-net tests first (3.1, 3.2), then refactor (Phase 2), then continue Phase 3. Refactoring without tests is how “working stuff” breaks. The steps are numbered by topic, but do them in the order given in Section 6.

## 2. Phase 2, Ownership Refactor

Definition: after Phase 2 you can open any file and explain why it is shaped the way it is, and the app behaves exactly as before.


## 2.1 Working method (do this before touching code)

- 1. Create a branch: git checkout -b phase2-refactor .

- 2. Make one commit per step below. Small commits are easy to revert.

- 3. After each step run: npx tsc --noEmit , npm run lint , npm run build , then click through the affected screen.

- 4. If a screen changes at all, revert the commit and redo it smaller.

## 2.2 Naming conventions (decide once, write it down)

Agree on a short table with your team and apply it consistently. Suggested starting point:

| Thing Convention Example |
| --- |
| React components PascalCase, noun CircuitCanvas , GatePalette |
| Hooks use + verb/noun useCircuitState , useSimulation |
| Pure logic functions camelCase, verb first applySingleQubitGate , computeProbabilities API wrappers in lib/api verb + noun submitAssessment , fetchLearningPath Constants UPPER_SNAKE PASS_MARK_PERCENT |
| Edge Function files folder = function name submit-quiz/index.ts |

Rename only inside files you are already touching. Use your editor’s rename-symbol feature (F2 in VS Code) so every reference updates together. Do not rename database columns or Edge Function names. Those are contracts with the deployed backend.

## 2.3 Step-by-step refactor targets

Step 2.3.1: lib/quantum-simulator.ts (start here) Split the single file into three small modules, keeping the same public export so nothing else changes:

- lib/quantum/complex.ts : the {r, i} complex type and helpers ( add , mul , magnitudeSquared ).

- lib/quantum/gates.ts : the 2x2 matrices for X, Y, Z, H, S, T.

- lib/quantum/statevector.ts : gate application (single-qubit, CNOT, SWAP) and probability extraction.

- lib/quantum-simulator.ts : re-exports simulateQuantumCircuit so imports elsewhere keep working.

Add a comment at the top of each file stating the convention (qubit 0 = least significant bit) and why (it matches Qiskit’s bitstring order). Comments should explain reasons, not restate code.

Step 2.3.2: app/simulator/page.tsx (725 lines) Break it up by responsibility, not by line count:

- hooks/useCircuitState.ts : gates, qubit count, add/remove/undo logic.

- hooks/useSimulation.ts : live preview, calls the client engine, debounces if needed.

- components/simulator/GatePalette.tsx , CircuitCanvas.tsx , ResultsPanel.tsx , ExportTabs.tsx .

- page.tsx becomes a thin composition file (~100-150 lines).

Do it one extraction at a time. After each, the simulator must look and behave identically. Group the ~20 useState values: values that change together move into one useReducer only if it makes the code clearer. If not, leave them.

Step 2.3.3: One source of truth for types PlacedGate , SimulationResult and the gate list are currently defined in types/quantify.ts and re-declared inside several Edge Functions (Deno cannot import from types/ ). Keep the Edge Function copies, but add a header comment “must match types/quantify.ts ” and align them (add SWAP and M to save-circuit ). Later, a test can compare the lists.

Step 2.3.4: lib/api/* wrappers Confirm every wrapper has typed inputs and outputs and goes through lib/api/client.ts . Rename anything inconsistent using the table in 2.2. Keep mock fallbacks in lib/mock/ but make it explicit in a comment which call falls back to which mock.

Step 2.3.5: Edge Functions, readability only For each of the 10 functions add a header block with: purpose, request shape, response shape, auth rule, tables touched. Extract repeated code (CORS headers, JSON response helper, user resolution) into a short local helper at the top of each file. Do not try to share code across functions yet. Deno deployment of shared folders is a risk you don’t need before a demo.

Step 2.3.6: Comments standard Add a comment only where a new teammate would ask “why?”. Good: why a 70% pass mark, why the path is recomputed each call, why SECURITY DEFINER is used. Bad: // increment i . Aim for roughly 5-10 meaningful


comments per major file.

## 2.4 Phase 2 done when

- tsc , lint and build all pass

- Every screen behaves identically (checklist in Section 7)

- simulator/page.tsx is under ~200 lines

- quantum-simulator.ts is split, and its public export is unchanged

- Naming table written down and applied in touched files

## 3. Phase 3, Strengthen

## 3.1 Test infrastructure (do this first, before Phase 2)

Install Vitest, which works well with TypeScript and needs almost no config:

npm i -D vitest

Add scripts: "test": "vitest run" and "test:watch": "vitest" . Create tests/ at the repo root. Start with pure functions only

(simulator, parser, grading helpers). These need no Supabase, so they are fast and reliable.

## 3.2 Simulator test suite (highest value)

Write these tests against simulateQuantumCircuit before refactoring. They become your safety net.

| Test Circuit Expected |
| --- |
| Identity 1 qubit, no gates \|0⟩ with probability 1 Pauli-X flip X on q0 \|1⟩ with probability 1 Hadamard H on q0 50% / 50% |
| H twice H, H back to \|0⟩ Z has no effect on \|0⟩ Z on q0 \|0⟩ probability 1 Bell state H q0, CNOT(q0→q1) 50% 00 , 50% 11 , isEntangled = true CNOT no-op CNOT with control at \|0⟩ state unchanged |
| SWAP 2 qubits: X q0, then SWAP(0,1) Only the state with the bit moved to q1 has probability 1 SWAP equivalence old vs new SWAP implementation on all basis Identical output. This proves your rewrite did states not change behavior Invalid inputs CNOT with control = target, qubit index out of Gate skipped, no crash range Normalization Any random circuit Probabilities sum to 1 within 1e-9 Asymmetric bit order 2 qubits: X on q0 Client returns 01 . Record it. Step 3.3 uses this |

Keep the old SWAP code in the test file as a reference function for the equivalence test. This is also your evidence that the rewrite was safe.

## 3.3 Align qubit-order between client and server

The two simulators disagree on which bit is qubit 0. Real Qiskit prints bitstrings little-endian (qubit 0 is the rightmost bit). That means:

- lib/quantum-simulator.ts (client, LSB) already matches Qiskit.

- simulate-circuit (Edge Function, MSB) is the odd one out.

Recommendation: make the Edge Function LSB. Steps:


- 1. Write a contract test file with 4-5 asymmetric circuits and the expected output strings (from the client engine).

- 2. In simulate-circuit , replace qubitCount - 1 - t style index math with the direct t index.

- 3. Check the state-label formatting (bit string padding) still prints qubit 0 on the right.

- 4. Confirm the generated OpenQASM and Python snippets are unchanged (they describe gates, not labels).

- 5. Run the contract circuits through both engines and compare.

If you have no time for this, keep the documentation-only approach and say so honestly. Do not present it as fixed.

## 3.4 save-circuit ownership check

Add this before the upsert in backend/functions/save-circuit/index.ts :

```
const { data: existing } = await supabase
.from('saved_circuits').select('user_id').eq('id', circuitId).maybeSingle()
if (existing && existing.user_id !== userId) {
return new Response(JSON.stringify({ error: 'Forbidden' }),
{ status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
```

}

Test by saving a circuit as user A, then attempting to overwrite it as user B. Expected result: 403. Do the same review for any other function that writes using a client-supplied id.

## 3.5 Input validation in Edge Functions

The functions use the service role key (which bypasses RLS), so validation inside the function is the security boundary. Add

these checks:

| Function Validate |
| --- |
| simulate-circuit gate type is in the whitelist, qubit indices within 0..qubitCount-1 , |
| qubitCount 1-32 (consider 10 for browser sanity), shots within limits |
| save-circuit same gate whitelist, title and description length caps, max gates per circuit submit-assessment / submit-quiz answers is an object, keys are known question ids, ignore unknown ids tutor-chat message length cap, mode in the allowed list, rate limit per user if feasible admin functions confirm the caller is admin inside the function, not only in the UI |

Return clear 400 errors with a message. Never crash on bad input.

## 3.6 Grading and path logic tests

Extract the grading logic into pure functions (input: questions and answers, output: score, category breakdown, tier) and test

them:

- perfect score, zero score, unknown option id, missing answers

- tier boundaries at the admin-configurable cutoffs (exactly 3 and 7 by default)

- quiz pass mark exactly at 70%

- learning-path status assignment: first incomplete becomes in_progress , weak categories jump to the top

## 3.7 Reduce any

About 152 occurrences. Do not try to remove all of them. Prioritize:

- 1. Data crossing a boundary: API responses, Edge Function payloads, Supabase rows.

- 2. Auth and grading code.

- 3. Leave low-risk UI event handlers for last.

Use unknown and narrow with a small type guard or a Zod-style check. Re-run tsc after each file.

3.8 Decide how you describe “Qiskit Aer”


Pick one and make code, README and slides consistent:

- Option A (fastest, honest): rename the response label to something like "Custom statevector simulator (Qiskit- compatible output)" .

- Option B (more work): actually run Qiskit for a “verify on Qiskit” feature using the existing qiskit_simulator.py on a small Python service. Only do this if you have time and can host it. It adds a deployment risk before a demo.

Recommended: Option A, plus a slide saying you validated your simulator’s results against known Qiskit outputs for Bell, GHZ and superposition circuits (only claim this after you have actually done the comparison).

## 3.9 Secrets and configuration

- Keep the anon key public-safe, but confirm the service role key is never in the repo or the frontend bundle. Search the repo: grep -rni "service_role" .

- Confirm .env.local is in .gitignore .

- Move the hardcoded fallback in middleware.ts to an env-only read if you want a strict setup, but only after confirming .env.local exists in every environment you demo from.

## 3.10 Documentation you write yourselves

| Doc Content README.md Correct claims only. Setup steps, env vars, how to run tests, honest description of the simulator docs/ARCHITECTURE.md The diagram and data flow in your own words |
| --- |
| docs/API.md Each Edge Function: request, response, auth, errors |
| docs/DECISIONS.md Short entries: why stateless learning path, why server-side grading, why |
| a custom simulator, qubit order choice docs/TESTING.md What is tested, how to run, what is not tested |

DECISIONS.md is the most useful for judges. It shows you understand the trade-offs.

## 3.11 CI (small and worth it)

Create .github/workflows/ci.yml that runs on every push: install, tsc --noEmit , npm run lint , npm test , npm run build . About 20 lines. It gives you a green badge and prevents last-minute breakage.

## 3.12 Phase 3 done when

- npm test passes with the simulator, grading and path tests

- Ownership check in place and tested with two users

- Edge Functions reject bad input with 400s

- Qubit order aligned, or clearly documented as a known limitation

- “Qiskit” wording consistent everywhere

- README and docs/ describe only what is true

- CI is green

## 4. Phase 4, Demo Readiness and Defense

## 4.1 Deployment run-through

Follow the existing DEMO_DEPLOYMENT_CHECKLIST.md in order: CLI login and link, apply the 3 migrations in date order, deploy the 10 functions, set env vars, seed data. Do this on a clean machine or fresh clone at least once so you know it works without hidden local state.

## 4.2 Demo script (5-7 minutes)

- 1. Sign up (shows the auto-created profile).


- 2. Take the diagnostic assessment and see the tier.

- 3. Show the adaptive path with weak topics on top.

- 4. Open a topic and pass its quiz. Watch progress and badges update.

- 5. Build a Bell state in the simulator, show 50/50 and the entanglement flag, export QASM.

- 6. Ask Quanta about the circuit (“explain like I’m new”).

- 7. Admin panel: change a tier cutoff and show the effect.

Rehearse it 3 times end to end. Pre-create a demo account and a backup one.

## 4.3 Failure fallbacks

| If this fails | Do this |
| --- | --- |
| Gemini rate limit | Show the built-in fallback message and explain it is deliberate |
| Network drop | Mock fallback data keeps screens populated (know which screens) |
| Supabase cold start | Open the app a few minutes before |
| Edge Function error | Client engine still simulates live in the browser |

## 4.4 Defense drills

Have each teammate answer these out loud, in their own words, in under 45 seconds:

- 1. How is grading protected against cheating?

- 2. What does RLS do, and why SECURITY DEFINER for is_admin() ?

- 3. Walk through one Bell-state simulation, from gate drop to bar chart.

- 4. Do you run Qiskit? (Answer honestly per Step 3.8.)

- 5. Why is the learning path recomputed rather than stored?

- 6. What happens when Gemini is down?

- 7. What are the three biggest known limitations, and how would you fix them?

- 8. Who built what?

Assign each person the modules named in the README so nobody is surprised by a question about their own area.

## 4.5 Final freeze

24 hours before the demo: stop refactoring. Only fix demo-breaking bugs. Tag the release: git tag demo-v1 .

## 5. Suggested Schedule

Adjust to your real deadline. If you have fewer days, compress but keep the order.

| Day | Focus |   |   |
| --- | --- | --- | --- |
| 1 | Add Vitest. Write simulator tests (3.1, 3.2). Apply ownership fix (3.4) |   |   |
| 2 | Refactor | quantum-simulator.ts | (2.3.1). Start simulator page split |
|   | (2.3.2) |   |   |
| 3 | Finish simulator page, types, API wrappers (2.3.2 to 2.3.4). Full |   |   |
|   | regression click-through |   |   |
| 4 | Edge Function headers and validation (2.3.5, 3.5). Qubit-order alignment |   |   |
|   | (3.3) |   |   |
| 5 | Grading and path tests (3.6). | any | cleanup on boundaries (3.7). Qiskit |
|   | wording (3.8) |   |   |
| 6 | Docs (3.10), CI (3.11), secrets check (3.9) |   |   |
| 7 | Deployment run-through, demo script rehearsal, defense drills (Phase 4) |   |   |


## 6. Recommended Execution Order

- 1. 3.1 and 3.2: install Vitest, write simulator tests (safety net).

- 2. 3.4: ownership fix (small, high value).

- 3. 2.3.1 to 2.3.4: structural refactor, running tests after each step.

- 4. 3.5, 3.3, 3.6: hardening and alignment.

- 5. 2.3.5 and 2.3.6: Edge Function readability and comments.

- 6. 3.7 to 3.11: cleanup, docs, CI.

- 7. Phase 4.

## 7. Regression Checklist (run after every refactor step)

- npx tsc --noEmit passes

- npm run lint passes

- npm run build passes

- npm test passes (once installed)

- Sign up and log in work

- Assessment submits and shows a tier

- Learning path loads with statuses

- A quiz submits and updates progress

- Simulator: drag gates, live preview updates, Bell state shows 50/50

- Simulator: save a circuit, reload it, open it

- Tutor replies (or shows the fallback message)

- Achievements page loads

- Admin panel loads for an admin and is blocked for a normal user

## 8. Risk Register

| Risk Likelihood Impact Mitigation Refactor silently changes behavior Medium High Tests first, one commit per step, regression checklist Qubit-order change confuses Medium Medium Contract tests, review every label saved circuits or UI labels that shows bit strings Edge Function redeploy breaks the Low High Deploy early, freeze 24 hours live demo before, keep a tagged good |
| --- |
| version |
| Running out of time High Medium Follow the order in Section 6. |
| Steps 1, 2 and 4 alone already |
| improve safety a lot |
| Judges ask about something you Medium High Defense drills, module ownership did not read per teammate Claiming something the code does Low High Docs describe only verified facts not do (Step 3.10, 3.8) |

## 9. Quick Command Reference


git checkout -b phase2-refactor npm i -D vitest npx tsc --noEmit npm run lint npm run build npm test grep -rni "service_role" .

git tag demo-v1
